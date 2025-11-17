package handlers

import (
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

	c.JSON(201, gin.H{"message": "quiz created successfully", "quiz": quiz})
}

func (h *QuizHandler) GetQuiz(c *gin.Context) {
	id, err := GetParamUint(c, "id")
	if err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	// Check if request is for taking quiz (exclude correct answers) or managing (include all)
	includeAnswers := c.Query("includeAnswers") == "true"

	quiz, err := h.serv.GetQuiz(id, includeAnswers)
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(200, gin.H{"quiz": quiz})
}

func (h *QuizHandler) UpdateQuiz(c *gin.Context) {
	id, err := GetParamUint(c, "id")
	if err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	var quiz models.Quiz
	if err := c.ShouldBindJSON(&quiz); err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	if err := h.serv.UpdateQuiz(id, &quiz); err != nil {
		SendError(err, c)
		return
	}

	HandleOk(c, "quiz updated successfully")
}

func (h *QuizHandler) DeleteQuiz(c *gin.Context) {
	id, err := GetParamUint(c, "id")
	if err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	if err := h.serv.DeleteQuiz(id); err != nil {
		SendError(err, c)
		return
	}

	HandleOk(c, "quiz deleted successfully")
}

func (h *QuizHandler) GetQuizzesByCourse(c *gin.Context) {
	courseID, err := GetParamUint(c, "courseId")
	if err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	quizzes, err := h.serv.GetQuizzesByCourse(courseID)
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(200, gin.H{"quizzes": quizzes})
}

func (h *QuizHandler) StartQuizAttempt(c *gin.Context) {
	quizID, err := GetParamUint(c, "id")
	if err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	userID := GetUserID(c)

	submission, err := h.serv.StartQuizAttempt(quizID, userID)
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(201, gin.H{"message": "quiz attempt started", "submission": submission})
}

func (h *QuizHandler) SaveQuizProgress(c *gin.Context) {
	submissionID, err := GetParamUint(c, "submissionId")
	if err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	var requestBody struct {
		Answers []models.Answer `json:"answers"`
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	if err := h.serv.SaveQuizProgress(submissionID, requestBody.Answers); err != nil {
		SendError(err, c)
		return
	}

	HandleOk(c, "progress saved successfully")
}

func (h *QuizHandler) SubmitQuizAttempt(c *gin.Context) {
	submissionID, err := GetParamUint(c, "submissionId")
	if err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	// Optionally save final answers before submitting
	var requestBody struct {
		Answers []models.Answer `json:"answers"`
	}

	if err := c.ShouldBindJSON(&requestBody); err == nil && len(requestBody.Answers) > 0 {
		if err := h.serv.SaveQuizProgress(submissionID, requestBody.Answers); err != nil {
			SendError(err, c)
			return
		}
	}

	submission, err := h.serv.SubmitQuizAttempt(submissionID)
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(200, gin.H{"message": "quiz submitted successfully", "submission": submission})
}

func (h *QuizHandler) GetQuizResults(c *gin.Context) {
	submissionID, err := GetParamUint(c, "submissionId")
	if err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	userID := GetUserID(c)

	submission, err := h.serv.GetQuizResults(submissionID, userID)
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(200, gin.H{"results": submission})
}

func (h *QuizHandler) GetQuizAnalytics(c *gin.Context) {
	quizID, err := GetParamUint(c, "id")
	if err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	analytics, err := h.serv.GetQuizAnalytics(quizID)
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(200, gin.H{"analytics": analytics})
}

func (h *QuizHandler) GetUserSubmissions(c *gin.Context) {
	quizID, err := GetParamUint(c, "id")
	if err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	userID := GetUserID(c)

	submissions, err := h.serv.GetUserSubmissions(quizID, userID)
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(200, gin.H{"submissions": submissions})
}
