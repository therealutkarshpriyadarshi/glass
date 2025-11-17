package routes

import (
	"server/app/handlers"
	"server/app/middlewares"
	"server/app/services"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetUpUserRoutes(r gin.IRouter, db *gorm.DB, secret []byte, expiration time.Duration) {
	service := services.NewUserService(db, secret, expiration)
	handler := handlers.NewUserHandler(service)

	secretString := string(secret)
	{
		router := r.Group("/users")
		// Apply rate limiting to auth endpoints to prevent brute force attacks
		router.POST("/login",
			middlewares.AuthRateLimitMiddleware(),
			handler.Login)
		router.POST("/register",
			middlewares.AuthRateLimitMiddleware(),
			handler.Register)
		router.GET("/profile",
			middlewares.AuthMiddleware(secretString),
			handler.GetProfile)

		router.PUT("/profile",
			middlewares.AuthMiddleware(secretString),
			handler.UpdateProfile)
		router.DELETE("/profile",
			middlewares.AuthMiddleware(secretString),
			handler.DeleteUser)
		router.POST("/password/change",
			middlewares.AuthMiddleware(secretString),
			handler.ChangePassword)

		// Course-related endpoints
		router.GET("/courses",
			middlewares.AuthMiddleware(secretString),
			handler.GetEnrolledCourses)
		router.GET("/created-courses",
			middlewares.AuthMiddleware(secretString),
			handler.GetCreatedCourses)
	}
}
