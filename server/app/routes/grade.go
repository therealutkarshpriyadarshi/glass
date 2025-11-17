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
	notificationService := services.NewNotificationService(db)
	gradeHandler := handlers.NewGradeHandler(gradeService, notificationService)

	grades := r.Group("/grades")
	grades.Use(middlewares.AuthMiddleware(secret))
	{
		// Public (authenticated) endpoints
		grades.GET("/:gradeId", gradeHandler.GetGrade)
		grades.GET("/user/:userId", gradeHandler.GradesForUser)

		// Protected endpoints - require grade ownership (teacher/admin of the course)
		grades.POST("/",
			gradeHandler.Create) // Note: Authorization checked in handler
		grades.PUT("/:gradeId",
			middlewares.GradeOwnershipMiddleware(db),
			gradeHandler.UpdateGrade)

		// Assignment-based endpoints - require assignment ownership
		grades.GET("/assignment/:assignmentId",
			middlewares.AssignmentOwnershipMiddleware(db),
			gradeHandler.GetGradesForAssignment)
		grades.GET("/statistics/:assignmentId",
			middlewares.AssignmentOwnershipMiddleware(db),
			gradeHandler.GradeStats)
	}
}
