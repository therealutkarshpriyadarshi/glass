package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"server/app/handlers"
	"server/app/services"
)

func SetupAssignmentRoutes(r *gin.Engine, db *gorm.DB) {
	assignmentService := services.NewAssignmentService(db)
	assignmentHandler := handlers.NewAssignmentHandler(assignmentService)

	assignments := r.Group("/assignments")
	{
		assignments.POST("/", assignmentHandler.Create)
		assignments.GET("/:id", assignmentHandler.Get)
		assignments.PUT("/:id", assignmentHandler.UpdateAssignment)
		assignments.DELETE("/:id", assignmentHandler.Delete)
		assignments.GET("/course/:courseId", assignmentHandler.GetAssignmentsForCourse)
		assignments.POST("/:id/publish", assignmentHandler.PublishAssignment)
		assignments.POST("/:id/unpublish", assignmentHandler.UnpublishAssignment)
		assignments.GET("/upcoming", assignmentHandler.GetUpcomingAssignments)
		assignments.GET("/overdue", assignmentHandler.GetOverdueAssignments)
		assignments.GET("/:id/completion", assignmentHandler.GetAssignmentCompletion)
	}
}
