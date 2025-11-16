package routes

import (
	"server/app/handlers"
	"server/app/middlewares"
	"server/app/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupCourseRoutes(router gin.IRouter, db *gorm.DB, secret string) {
	courseService := services.NewCourseService(db)
	courseHandler := handlers.NewCourseHandler(courseService)

	courseRoutes := router.Group("/courses")
	courseRoutes.Use(middlewares.AuthMiddleware(secret))
	{
		// Public (authenticated) endpoints
		courseRoutes.POST("/", courseHandler.CreateCourse)
		courseRoutes.GET("/", courseHandler.GetCourses)
		courseRoutes.GET("/:id", courseHandler.GetCourseByID)

		// Protected endpoints - require course ownership (teacher/admin)
		courseRoutes.PUT("/:id",
			middlewares.CourseOwnershipMiddleware(db),
			courseHandler.UpdateCourse)
		courseRoutes.DELETE("/:id",
			middlewares.CourseOwnershipMiddleware(db),
			courseHandler.DeleteCourse)
		courseRoutes.POST("/:id/invitation-code",
			middlewares.CourseOwnershipMiddleware(db),
			courseHandler.GenerateInvitationCode)
		courseRoutes.GET("/:id/students",
			middlewares.CourseOwnershipMiddleware(db),
			courseHandler.GetCourseStudents)
	}
}
