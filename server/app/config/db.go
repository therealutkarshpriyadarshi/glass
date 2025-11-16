package config

import (
	"fmt"
	"log"
	"os"
	"server/app/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// InitDB initializes the database connection
// It retrieves the database connection details from environment variables
// and establishes a connection to the database using GORM.
// It also automatically migrates the database models.
//
// Returns:
//   - *gorm.DB: The initialized database connection.
func InitDB() *gorm.DB {
	dbHost := os.Getenv("DB_HOST")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbPort := os.Getenv("DB_PORT")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Shanghai", dbHost, dbUser, dbPassword, dbName, dbPort)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto Migrate the models
	err = db.AutoMigrate(&models.Course{})
	if err != nil {
		log.Fatalf("Failed to auto migrate models: %v", err)
	}
	return db
}
