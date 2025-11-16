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

	// Set up routes
	routes.SetUpUserRoutes(r, db, []byte(secret), expiration)
	routes.SetupCourseRoutes(r, db)
	routes.SetupGradeRoutes(r, db)
	routes.SetupAssignmentRoutes(r, db)
	routes.SetupEnrollmentRoutes(r, db)
	if cs != nil {
		routes.SetupSubmissionRoutes(r, db, cs)
		routes.SetupMaterialRoutes(r, db, cs)
	}
	routes.SetupQuizRoutes(r, db, secret)

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
