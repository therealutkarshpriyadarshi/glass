package main

import (
	"log"
	"os"
	"server/app/config"
	"server/app/firebase"
	"server/app/routes"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables (optional - .env may not exist in Docker)
	err := godotenv.Load()
	if err != nil {
		log.Printf("Warning: Error loading .env file %v (this is normal in Docker)", err)
	}

	// Initialize database
	db := config.InitDB()

	// Initialize Gin router
	r := gin.Default()

	// Get JWT secret and expiration from environment
	secret := os.Getenv("SECRET_KEY")
	if secret == "" {
		log.Fatal("SECRET_KEY environment variable is required")
	}
	expiration := 24 * time.Hour

	// Initialize Firebase Cloud Storage
	cs, err := firebase.DefaultCloudStorage()
	if err != nil {
		log.Printf("Warning: Firebase storage initialization failed: %v", err)
		// Don't panic - allow server to run without Firebase for basic functionality
	}

	// Configure CORS
	clientURL := os.Getenv("CLIENT_URL")
	if clientURL == "" {
		log.Println("Warning: CLIENT_URL not set, allowing all origins (development only)")
		r.Use(cors.New(cors.Config{
			AllowAllOrigins:  true,
			AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
			AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
			ExposeHeaders:    []string{"Content-Length"},
			AllowCredentials: true,
			MaxAge:           12 * time.Hour,
		}))
	} else {
		r.Use(cors.New(cors.Config{
			AllowOrigins:     []string{clientURL},
			AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
			AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
			ExposeHeaders:    []string{"Content-Length"},
			AllowCredentials: true,
			MaxAge:           12 * time.Hour,
		}))
	}
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// Create API group
	api := r.Group("/api")

	// Set up routes under /api prefix
	routes.SetUpUserRoutes(api, db, []byte(secret), expiration)
	routes.SetupCourseRoutes(api, db, secret)
	routes.SetupGradeRoutes(api, db, secret)
	routes.SetupAssignmentRoutes(api, db, secret)
	routes.SetupEnrollmentRoutes(api, db, secret)
	if cs != nil {
		routes.SetupSubmissionRoutes(api, db, cs, secret)
		routes.SetupMaterialRoutes(api, db, cs, secret)
	}
	routes.SetupQuizRoutes(api, db, secret)
	routes.SetupNotificationRoutes(api, db, secret)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
