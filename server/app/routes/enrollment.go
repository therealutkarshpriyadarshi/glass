package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"server/app/handlers"
	"server/app/middlewares"
	"server/app/services"
)

func SetupEnrollmentRoutes(r gin.IRouter, db *gorm.DB, secret string) {
	enrollmentService := services.NewEnrollmentService(db)
	notificationService := services.NewNotificationService(db)
	enrollmentHandler := handlers.NewEnrollmentHandler(enrollmentService, notificationService)

	enrollmentRoutes := r.Group("/enrollments")
	enrollmentRoutes.Use(middlewares.AuthMiddleware(secret))

	{
		enrollmentRoutes.POST("/join", enrollmentHandler.JoinCourseByCode)
		enrollmentRoutes.PUT("/approve/:id", enrollmentHandler.EnrollToCourse)
		enrollmentRoutes.PUT("/reject/:id", enrollmentHandler.RejectEnrollment)
		enrollmentRoutes.GET("/course/:id", enrollmentHandler.GetPendingEnrollments)
	}
}
