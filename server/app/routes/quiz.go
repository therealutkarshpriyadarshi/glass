package routes

import (
	"server/app/handlers"
	"server/app/middlewares"
	"server/app/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupQuizRoutes(r gin.IRouter, db *gorm.DB, secret string) {
	quizService := services.NewQuizService(db)
	quizHandler := handlers.NewQuizHandler(quizService)

	quizRoutes := r.Group("/quizzes")
	quizRoutes.Use(middlewares.AuthMiddleware(secret))
	{
		// Create quiz (requires enrollment - checked in handler)
		quizRoutes.POST("/", quizHandler.CreateQuiz)

		// Get quiz by ID (authenticated users can view)
		quizRoutes.GET("/:id", quizHandler.GetQuiz)

		// Update quiz (only creator can update)
		quizRoutes.PUT("/:id", middlewares.QuizCreatorMiddleware(db), quizHandler.UpdateQuiz)

		// Delete quiz (only creator can delete)
		quizRoutes.DELETE("/:id", middlewares.QuizCreatorMiddleware(db), quizHandler.DeleteQuiz)

		// Get quizzes by course (enrolled users can view)
		quizRoutes.GET("/course/:courseId", quizHandler.GetQuizzesByCourse)

		// Quiz attempt routes
		quizRoutes.POST("/:id/attempts", quizHandler.StartQuizAttempt)
		quizRoutes.PUT("/attempts/:submissionId/progress", quizHandler.SaveQuizProgress)
		quizRoutes.POST("/attempts/:submissionId/submit", quizHandler.SubmitQuizAttempt)

		// Get quiz results (student's own results)
		quizRoutes.GET("/attempts/:submissionId/results", quizHandler.GetQuizResults)

		// Get analytics (only creator can view analytics)
		quizRoutes.GET("/:id/analytics", middlewares.QuizCreatorMiddleware(db), quizHandler.GetQuizAnalytics)

		// Get user's submissions for a quiz
		quizRoutes.GET("/:id/submissions", quizHandler.GetUserSubmissions)
	}
}
