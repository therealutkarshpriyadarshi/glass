package setup

import (
	"context"
	"database/sql"
	"fmt"
	"io"
	"log"
	"time"

	_ "github.com/lib/pq"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

const (
	dbName     = "testdb"
	dbUser     = "postgres"
	dbPassword = "testpass"
	dbPort     = "5432"
)

var (
	dockerClient *client.Client
	containerId  string
	testDB       *gorm.DB
	networkID    string
)

// SetupTestDB initializes a test database using Docker.
// It pulls a Postgres image, creates and starts a container, and sets up the database.
// It also runs any necessary migrations for the provided models.
func SetupTestDB(ctx context.Context, models ...interface{}) (*gorm.DB, error) {
	var err error
	dockerClient, err = client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, fmt.Errorf("failed to create docker client: %v", err)
	}

	// Check if the network already exists
	networks, err := dockerClient.NetworkList(ctx, network.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list networks: %v", err)
	}

	networkName := "postgres-network"
	networkExists := false
	for _, network := range networks {
		if network.Name == networkName {
			networkID = network.ID
			networkExists = true
			break
		}
	}

	// Create a Docker network if it doesn't exist
	if !networkExists {
		networkResp, err := dockerClient.NetworkCreate(ctx, networkName, network.CreateOptions{})
		if err != nil {
			return nil, fmt.Errorf("failed to create network: %v", err)
		}
		networkID = networkResp.ID
	}

	postgresImage := "postgres:13"
	reader, err := dockerClient.ImagePull(ctx, postgresImage, image.PullOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to pull postgres image: %v", err)
	}
	io.Copy(io.Discard, reader)

	// Create the container
	resp, err := dockerClient.ContainerCreate(ctx,
		&container.Config{
			Image: postgresImage,
			Env: []string{
				fmt.Sprintf("POSTGRES_DB=%s", dbName),
				fmt.Sprintf("POSTGRES_USER=%s", dbUser),
				fmt.Sprintf("POSTGRES_PASSWORD=%s", dbPassword),
			},
			ExposedPorts: nat.PortSet{
				"5432/tcp": struct{}{},
			},
		},
		&container.HostConfig{
			PortBindings: nat.PortMap{
				"5432/tcp": []nat.PortBinding{
					{
						HostIP:   "0.0.0.0",
						HostPort: dbPort,
					},
				},
			},
		},
		nil, nil, "")
	if err != nil {
		return nil, fmt.Errorf("failed to create container: %v", err)
	}
	containerId = resp.ID

	// Connect the container to the network
	err = dockerClient.NetworkConnect(ctx, networkID, containerId, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to connect container to network: %v", err)
	}

	// Start the container
	err = dockerClient.ContainerStart(ctx, containerId, container.StartOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to start container: %v", err)
	}

	// Add a delay to allow the container to fully start
	time.Sleep(5 * time.Second)

	// Get container IP
	containerIP, err := getContainerIP(ctx, containerId)
	if err != nil {
		return nil, fmt.Errorf("failed to get container IP: %v", err)
	}

	// Wait for the database to be ready
	if err := waitForDB(containerIP); err != nil {
		return nil, fmt.Errorf("database not ready: %v", err)
	}

	// Connect to the database
	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		dbUser, dbPassword, containerIP, dbPort, dbName)
	testDB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}

	// Run migrations
	if err := testDB.AutoMigrate(models...); err != nil {
		return nil, fmt.Errorf("failed to run migrations: %v", err)
	}

	return testDB, nil
}

func getContainerIP(ctx context.Context, containerID string) (string, error) {
	if dockerClient == nil {
		return "", fmt.Errorf("docker client is nil")
	}
	containerJSON, err := dockerClient.ContainerInspect(ctx, containerID)
	if err != nil {
		return "", fmt.Errorf("failed to inspect container: %v", err)
	}
	if containerJSON.NetworkSettings == nil || containerJSON.NetworkSettings.Networks == nil {
		return "", fmt.Errorf("network settings are nil")
	}
	network, exists := containerJSON.NetworkSettings.Networks[networkID]
	if !exists {
		return "", fmt.Errorf("network %s not found for container", networkID)
	}
	return network.IPAddress, nil
}

func waitForDB(host string) error {
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, dbPort, dbUser, dbPassword, dbName)

	log.Printf("Attempting to connect with DSN: host=%s port=%s user=%s dbname=%s sslmode=disable",
		host, dbPort, dbUser, dbName)

	for i := 0; i < 60; i++ {
		db, err := sql.Open("postgres", dsn)
		if err == nil {
			defer db.Close()

			ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
			defer cancel()

			err = db.PingContext(ctx)
			if err == nil {
				_, err = db.ExecContext(ctx, "CREATE TABLE IF NOT EXISTS test_connection (id SERIAL PRIMARY KEY)")
				if err == nil {
					return nil
				}
			}
			log.Printf("Database not ready: %v", err)
		} else {
			log.Printf("Database connection failed: %v", err)
		}
		time.Sleep(2 * time.Second)
	}
	return fmt.Errorf("timeout waiting for database to be ready")
}

// CleanupTestDB closes the database connection and removes the Docker container.
func CleanupTestDB(ctx context.Context) {
	if testDB != nil {
		db, _ := testDB.DB()
		db.Close()
	}

	if containerId != "" {
		// Print container logs
		logs, err := dockerClient.ContainerLogs(ctx, containerId, container.LogsOptions{ShowStdout: true, ShowStderr: true})
		if err != nil {
			log.Printf("Failed to get container logs: %v", err)
		} else {
			defer logs.Close()
			logContent, _ := io.ReadAll(logs)
			log.Printf("Container logs:\n%s", string(logContent))
		}

		// Stop the container
		timeout := 10
		err = dockerClient.ContainerStop(ctx, containerId, container.StopOptions{Timeout: &timeout})
		if err != nil {
			log.Printf("Failed to stop container: %v", err)
		}

		// Remove the container
		err = dockerClient.ContainerRemove(ctx, containerId, container.RemoveOptions{Force: true})
		if err != nil {
			log.Printf("Failed to remove container: %v", err)
		}
	}

	if networkID != "" {
		// Remove the network
		err := dockerClient.NetworkRemove(ctx, networkID)
		if err != nil {
			log.Printf("Failed to remove network: %v", err)
		}
	}

	if dockerClient != nil {
		dockerClient.Close()
	}
}
