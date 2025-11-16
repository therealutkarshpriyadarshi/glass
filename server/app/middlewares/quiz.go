package middlewares

import (
	"server/app/handlers"
	"server/app/services"

	"github.com/gin-gonic/gin"
)

// QuizCreatorMiddleware is a middleware that checks if the user is the creator of the quiz
// It expects the quiz ID to be in the URL param "id"
// It sets the "isQuizCreator" context key to true
// if the user is the creator of the quiz
func QuizCreatorMiddleware(serv *services.QuizService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userId, err := getUserId(c)
		if err != nil {
			HandleBadRequestWithAbort(c, "User not found")
			return
		}

		quizID, err := handlers.GetParamUint(c, "id")
		if err != nil {
			HandleBadRequestWithAbort(c, "Quiz not found")
			return
		}

		isCreator, err := serv.IsCreator(userId, quizID)
		if err != nil {
			HandleInternalServerError(c, "Error checking if user is creator")
			return
		}

		c.Set("isQuizCreator", isCreator)
		c.Next()
	}
}
