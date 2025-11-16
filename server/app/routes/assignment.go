package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"server/app/handlers"
	"server/app/middlewares"
	"server/app/services"
)

func SetupAssignmentRoutes(r gin.IRouter, db *gorm.DB, secret string) {
	assignmentService := services.NewAssignmentService(db)
	assignmentHandler := handlers.NewAssignmentHandler(assignmentService)

	assignments := r.Group("/assignments")
	assignments.Use(middlewares.AuthMiddleware(secret))
	{
		// Public (authenticated) endpoints
		assignments.POST("/", assignmentHandler.Create) // Note: Should ideally check course ownership
		assignments.GET("/:id", assignmentHandler.Get)
		assignments.GET("/course/:courseId", assignmentHandler.GetAssignmentsForCourse)
		assignments.GET("/upcoming", assignmentHandler.GetUpcomingAssignments)
		assignments.GET("/overdue", assignmentHandler.GetOverdueAssignments)

		// Protected endpoints - require assignment ownership (teacher/admin of the course)
		assignments.PUT("/:id",
			middlewares.AssignmentOwnershipMiddleware(db),
			assignmentHandler.UpdateAssignment)
		assignments.DELETE("/:id",
			middlewares.AssignmentOwnershipMiddleware(db),
			assignmentHandler.Delete)
		assignments.POST("/:id/publish",
			middlewares.AssignmentOwnershipMiddleware(db),
			assignmentHandler.PublishAssignment)
		assignments.POST("/:id/unpublish",
			middlewares.AssignmentOwnershipMiddleware(db),
			assignmentHandler.UnpublishAssignment)
		assignments.GET("/:id/completion",
			middlewares.AssignmentOwnershipMiddleware(db),
			assignmentHandler.GetAssignmentCompletion)
	}
}
