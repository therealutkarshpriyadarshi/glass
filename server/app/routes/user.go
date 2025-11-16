package routes

import (
	"server/app/handlers"
	"server/app/middlewares"
	"server/app/services"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetUpUserRoutes(r *gin.Engine, db *gorm.DB, secret []byte, expiration time.Duration) {
	service := services.NewUserService(db, secret, expiration)
	handler := handlers.NewUserHandler(service)

	secretString := string(secret)
	{
		router := r.Group("/users")
		router.POST("/login", handler.Login)
		router.POST("/register", handler.Register)
		router.GET("/profile",
			middlewares.AuthMiddleware(secretString),
			handler.GetProfile)

		router.PUT("/profile",
			middlewares.AuthMiddleware(secretString),
			handler.UpdateProfile)
		router.DELETE("/profile",
			middlewares.AuthMiddleware(secretString),
			handler.DeleteUser)
	}
}
