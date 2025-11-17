package services

import (
	"encoding/json"
	"errors"
	"server/app/models"
	"time"

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

func (q *QuizService) GetQuiz(quizID uint, includeAnswers bool) (*models.Quiz, error) {
	var quiz models.Quiz
	query := q.db.Preload("Questions.Options").Preload("Creator")

	if !includeAnswers {
		// For students taking the quiz, don't send the correct answers
		query = query.Preload("Questions", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, quiz_id, title, description, type, points")
		}).Preload("Questions.Options", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, question_id, text")
		})
	}

	if err := query.First(&quiz, quizID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, EntityNotFound(err)
		}
		return nil, err
	}

	return &quiz, nil
}

func (q *QuizService) UpdateQuiz(quizID uint, quiz *models.Quiz) error {
	var existingQuiz models.Quiz
	if err := q.db.First(&existingQuiz, quizID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return EntityNotFound(err)
		}
		return err
	}

	// Update basic fields
	updates := map[string]interface{}{
		"title":             quiz.Title,
		"description":       quiz.Description,
		"start_time":        quiz.StartTime,
		"end_time":          quiz.EndTime,
		"duration":          quiz.Duration,
		"shuffle_questions": quiz.ShuffleQuestions,
		"show_results":      quiz.ShowResults,
	}

	return q.db.Model(&existingQuiz).Updates(updates).Error
}

func (q *QuizService) DeleteQuiz(quizID uint) error {
	var quiz models.Quiz
	if err := q.db.First(&quiz, quizID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return EntityNotFound(err)
		}
		return err
	}

	// Delete quiz and cascade delete questions, options
	return q.db.Select("Questions.Options", "Questions").Delete(&quiz).Error
}

func (q *QuizService) GetQuizzesByCourse(courseID uint) ([]models.Quiz, error) {
	var quizzes []models.Quiz
	if err := q.db.Where("course_id = ?", courseID).
		Preload("Creator").
		Preload("Questions").
		Order("start_time DESC").
		Find(&quizzes).Error; err != nil {
		return nil, err
	}

	return quizzes, nil
}

func (q *QuizService) StartQuizAttempt(quizID, userID uint) (*models.QuizSubmission, error) {
	// Check if quiz exists
	var quiz models.Quiz
	if err := q.db.First(&quiz, quizID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, EntityNotFound(err)
		}
		return nil, err
	}

	// Check if quiz is currently active
	now := time.Now()
	if now.Before(quiz.StartTime) {
		return nil, errors.New("quiz has not started yet")
	}
	if now.After(quiz.EndTime) {
		return nil, errors.New("quiz has ended")
	}

	// Check if user already has an active submission
	var existingSubmission models.QuizSubmission
	if err := q.db.Where("quiz_id = ? AND user_id = ? AND end_time IS NULL", quizID, userID).
		First(&existingSubmission).Error; err == nil {
		return &existingSubmission, nil // Return existing active attempt
	}

	// Create new submission
	submission := models.QuizSubmission{
		QuizID:    quizID,
		UserID:    userID,
		StartTime: now,
	}

	if err := q.db.Create(&submission).Error; err != nil {
		return nil, err
	}

	return &submission, nil
}

func (q *QuizService) SaveQuizProgress(submissionID uint, answers []models.Answer) error {
	// Verify submission exists and is active
	var submission models.QuizSubmission
	if err := q.db.First(&submission, submissionID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return EntityNotFound(err)
		}
		return err
	}

	if !submission.EndTime.IsZero() {
		return errors.New("quiz submission already completed")
	}

	// Save or update answers
	for _, answer := range answers {
		// Convert SelectedOptions to JSON
		selectedJSON, err := json.Marshal(answer.SelectedOptions)
		if err != nil {
			return err
		}
		answer.SelectedOptionsJSON = string(selectedJSON)
		answer.SubmissionID = submissionID

		// Check if answer already exists
		var existingAnswer models.Answer
		err = q.db.Where("submission_id = ? AND question_id = ?", submissionID, answer.QuestionID).
			First(&existingAnswer).Error

		if err == nil {
			// Update existing answer
			q.db.Model(&existingAnswer).Updates(map[string]interface{}{
				"selected_options": answer.SelectedOptionsJSON,
			})
		} else if errors.Is(err, gorm.ErrRecordNotFound) {
			// Create new answer
			q.db.Create(&answer)
		} else {
			return err
		}
	}

	return nil
}

func (q *QuizService) SubmitQuizAttempt(submissionID uint) (*models.QuizSubmission, error) {
	var submission models.QuizSubmission
	if err := q.db.Preload("Answers").First(&submission, submissionID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, EntityNotFound(err)
		}
		return nil, err
	}

	if !submission.EndTime.IsZero() {
		return nil, errors.New("quiz submission already completed")
	}

	// Calculate score
	score, err := q.calculateScore(submission.QuizID, submission.Answers)
	if err != nil {
		return nil, err
	}

	// Update submission
	submission.EndTime = time.Now()
	submission.Score = score

	if err := q.db.Model(&submission).Updates(map[string]interface{}{
		"end_time": submission.EndTime,
		"score":    submission.Score,
	}).Error; err != nil {
		return nil, err
	}

	return &submission, nil
}

func (q *QuizService) calculateScore(quizID uint, answers []models.Answer) (float64, error) {
	// Get all questions with correct answers
	var questions []models.Question
	if err := q.db.Where("quiz_id = ?", quizID).Preload("Options").Find(&questions).Error; err != nil {
		return 0, err
	}

	totalPoints := 0
	earnedPoints := 0

	// Create a map of questionID to question for quick lookup
	questionMap := make(map[uint]models.Question)
	for _, q := range questions {
		questionMap[q.ID] = q
		totalPoints += q.Points
	}

	// Score each answer
	for _, answer := range answers {
		question, exists := questionMap[answer.QuestionID]
		if !exists {
			continue
		}

		// Unmarshal selected options
		var selectedOptions []uint
		if err := json.Unmarshal([]byte(answer.SelectedOptionsJSON), &selectedOptions); err != nil {
			continue
		}

		// Get correct option IDs
		correctOptionIDs := make(map[uint]bool)
		for _, option := range question.Options {
			if option.IsCorrect {
				correctOptionIDs[option.ID] = true
			}
		}

		// Check if answer is correct
		if len(selectedOptions) != len(correctOptionIDs) {
			continue // Wrong number of selections
		}

		allCorrect := true
		for _, optionID := range selectedOptions {
			if !correctOptionIDs[optionID] {
				allCorrect = false
				break
			}
		}

		if allCorrect {
			earnedPoints += question.Points
		}
	}

	if totalPoints == 0 {
		return 0, nil
	}

	return (float64(earnedPoints) / float64(totalPoints)) * 100, nil
}

func (q *QuizService) GetQuizResults(submissionID, userID uint) (*models.QuizSubmission, error) {
	var submission models.QuizSubmission
	if err := q.db.Where("id = ? AND user_id = ?", submissionID, userID).
		Preload("Answers").
		Preload("Quiz").
		First(&submission).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, EntityNotFound(err)
		}
		return nil, err
	}

	// Unmarshal selected options for each answer
	for i := range submission.Answers {
		var selectedOptions []uint
		if err := json.Unmarshal([]byte(submission.Answers[i].SelectedOptionsJSON), &selectedOptions); err == nil {
			submission.Answers[i].SelectedOptions = selectedOptions
		}
	}

	return &submission, nil
}

func (q *QuizService) GetQuizAnalytics(quizID uint) (map[string]interface{}, error) {
	var quiz models.Quiz
	if err := q.db.Preload("Questions").First(&quiz, quizID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, EntityNotFound(err)
		}
		return nil, err
	}

	// Get all submissions
	var submissions []models.QuizSubmission
	if err := q.db.Where("quiz_id = ?", quizID).
		Preload("User").
		Preload("Answers").
		Find(&submissions).Error; err != nil {
		return nil, err
	}

	// Calculate statistics
	totalAttempts := len(submissions)
	completedAttempts := 0
	var totalScore float64
	var highestScore float64
	var lowestScore float64 = 100

	for _, submission := range submissions {
		if !submission.EndTime.IsZero() {
			completedAttempts++
			totalScore += submission.Score
			if submission.Score > highestScore {
				highestScore = submission.Score
			}
			if submission.Score < lowestScore {
				lowestScore = submission.Score
			}
		}
	}

	averageScore := 0.0
	if completedAttempts > 0 {
		averageScore = totalScore / float64(completedAttempts)
	} else {
		lowestScore = 0
	}

	analytics := map[string]interface{}{
		"quizId":            quizID,
		"quizTitle":         quiz.Title,
		"totalAttempts":     totalAttempts,
		"completedAttempts": completedAttempts,
		"averageScore":      averageScore,
		"highestScore":      highestScore,
		"lowestScore":       lowestScore,
		"submissions":       submissions,
	}

	return analytics, nil
}

func (q *QuizService) GetUserSubmissions(quizID, userID uint) ([]models.QuizSubmission, error) {
	var submissions []models.QuizSubmission
	if err := q.db.Where("quiz_id = ? AND user_id = ?", quizID, userID).
		Order("start_time DESC").
		Find(&submissions).Error; err != nil {
		return nil, err
	}

	return submissions, nil
}
