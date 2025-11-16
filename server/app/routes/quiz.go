package routes

import (
	"server/app/handlers"
	"server/app/middlewares"
	"server/app/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupQuizRoutes(r *gin.Engine, db *gorm.DB, secret string) {
	quizService := services.NewQuizService(db)
	quizHandler := handlers.NewQuizHandler(quizService)

	quizRoutes := r.Group("/api/quizzes")
	quizRoutes.Use(middlewares.AuthMiddleware(secret))
	{
		quizRoutes.POST("/", quizHandler.CreateQuiz)
	}
}
