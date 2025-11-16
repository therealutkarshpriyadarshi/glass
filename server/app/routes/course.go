package routes

import (
	"server/app/handlers"
	"server/app/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupCourseRoutes(router *gin.Engine, db *gorm.DB) {
	courseService := services.NewCourseService(db)
	courseHandler := handlers.NewCourseHandler(courseService)

	courseRoutes := router.Group("/courses")
	{
		courseRoutes.POST("/", courseHandler.CreateCourse)
		courseRoutes.GET("/", courseHandler.GetCourses)
		courseRoutes.GET("/:id", courseHandler.GetCourseByID)
		courseRoutes.PUT("/:id", courseHandler.UpdateCourse)
		courseRoutes.DELETE("/:id", courseHandler.DeleteCourse)
	}
}
