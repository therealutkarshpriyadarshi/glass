package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"server/app/handlers"
	"server/app/middlewares"
	"server/app/services"
)

func SetupGradeRoutes(r gin.IRouter, db *gorm.DB, secret string) {
	gradeService := services.NewGradeService(db)
	gradeHandler := handlers.NewGradeHandler(gradeService)

	grades := r.Group("/grades")
	grades.Use(middlewares.AuthMiddleware(secret))
	{
		grades.POST("/", gradeHandler.Create)
		grades.GET("/:gradeId", gradeHandler.GetGrade)
		grades.PUT("/:gradeId", gradeHandler.UpdateGrade)
		grades.GET("/assignment/:assignmentId", gradeHandler.GetGradesForAssignment)
		grades.GET("/user/:userId", gradeHandler.GradesForUser)
		grades.GET("/statistics/:assignmentId", gradeHandler.GradeStats)
	}
}
