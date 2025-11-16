package handlers

import (
	"fmt"
	"server/app/models"
	"server/app/services"

	"github.com/gin-gonic/gin"
)

type QuizHandler struct {
	serv *services.QuizService
}

func NewQuizHandler(serv *services.QuizService) *QuizHandler {
	return &QuizHandler{serv: serv}
}

func (h *QuizHandler) CreateQuiz(c *gin.Context) {
	var quiz models.Quiz
	if err := c.ShouldBindJSON(&quiz); err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	quiz.CreatorID = GetUserID(c)
	for _, question := range quiz.Questions {
		queType := question.Type
		if queType != models.SingleCorrect && queType != models.MultiCorrect {
			HandleBadRequest(c, "Invalid question type")
			return
		}
	}

	if err := h.serv.CreateQuiz(&quiz); err != nil {
		SendError(err, c)
		return
	}

	HandleCreated(c, "quiz created successfully")
}

func (h *QuizHandler) GetQuiz(c *gin.Context) {
	id, err := GetParamUint(c, "id")
	if err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	fmt.Println("id", id)

}
