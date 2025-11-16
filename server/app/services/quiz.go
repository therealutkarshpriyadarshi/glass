package services

import (
	"errors"
	"server/app/models"

	"gorm.io/gorm"
)

type QuizService struct {
	db *gorm.DB
}

func NewQuizService(db *gorm.DB) *QuizService {
	return &QuizService{db: db}
}

func (q *QuizService) IsCreator(userID, quizID uint) (bool, error) {
	var quiz models.Quiz
	if err := q.db.First(&quiz, quizID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, EntityNotFound(err)
		}

		return false, err
	}

	return quiz.CreatorID == userID, nil
}

func (q *QuizService) CreateQuiz(quiz *models.Quiz) error {
	return q.db.Create(quiz).Error
}
