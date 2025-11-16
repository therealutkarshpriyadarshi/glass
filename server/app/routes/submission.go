package routes

import (
	"server/app/firebase"
	"server/app/handlers"
	"server/app/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupSubmissionRoutes(r *gin.Engine, db *gorm.DB, firestore *firebase.CloudStorage) {
	service := services.NewSubmissionService(db, firestore)
	handler := handlers.NewSubmissionHandler(service)
	{
		router := r.Group("/submissions")
		router.GET("/:"+handlers.SubmissionIDKey, handler.CheckCanSeeSubmissionMiddleware(),
			handler.GetSubmission)
		router.DELETE("/:"+handlers.SubmissionIDKey, handler.DeleteSubmission)
		router.GET("/assignment/:assignmentId",
			handler.CheckCanSeeSubmissionMiddleware(),
			handler.GetSubmissionsForAssignment)
		router.PUT("/:id", handler.UpdateSubmission)
	}
}
