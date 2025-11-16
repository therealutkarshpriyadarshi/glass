package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"server/app/handlers"
	"server/app/middlewares"
	"server/app/services"
)

func SetupEnrollmentRoutes(r *gin.Engine, db *gorm.DB) {
	enrollmentService := services.NewEnrollmentService(db)
	enrollmentHandler := handlers.NewEnrollmentHandler(enrollmentService)

	enrollmentRoutes := r.Group("/api/enrollments")
	enrollmentRoutes.Use(middlewares.AuthMiddleware("hello"))

	{
		enrollmentRoutes.POST("/join", enrollmentHandler.JoinCourseByCode)
		enrollmentRoutes.PUT("/approve/:id", enrollmentHandler.EnrollToCourse)
		enrollmentRoutes.PUT("/reject/:id", enrollmentHandler.RejectEnrollment)
		enrollmentRoutes.GET("/course/:courseId", enrollmentHandler.GetPendingEnrollments)
	}
}
