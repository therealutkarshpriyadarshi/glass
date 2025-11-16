package services

import (
	"server/app/models"
	"time"

	"gorm.io/gorm"
)

type GradeService struct {
	db *gorm.DB
}

func NewGradeService(db *gorm.DB) *GradeService {
	return &GradeService{db: db}
}

type GradeStats struct {
	AvgPoints float64
	MaxPoints float64
	MinPoints float64
}

// Create creates a new grade in the database for a submission.
//
// Parameters:
//   - subId: The ID of the submission being graded.
//   - graderId: The ID of the user grading the submission.
//   - pointsEarned: The number of points earned by the submission.
//   - feedback: The feedback given for the submission.
//
// Returns:
//   - *models.Grade: A pointer to the newly created grade, or nil if there was an error.
//   - error: An error if the creation operation failed, or nil if successful.
func (s *GradeService) Create(subId, graderId uint, pointsEarned float64, feedback string) (*models.Grade, error) {
	grade := models.Grade{
		SubmissionID: subId,
		GradedBy:     graderId,
		PointsEarned: pointsEarned,
		Feedback:     feedback,
		GradedAt:     time.Now(),
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&grade).Error; err != nil {
			return err
		}
		return tx.Model(&models.Submission{}).
			Where("id = ?", subId).Update("status", "graded").Error
	})

	if err != nil {
		return nil, err
	}

	return &grade, nil
}

// Get retrieves a grade from the database by its ID. It also preloads the related
// submission, submission's assignment, and the user who graded the submission.
//
// Parameters:
//   - gradeID: The ID of the grade to retrieve.
//
// Returns:
//   - *models.Grade: A pointer to the grade with the given ID, or nil if not found.
//   - error: An error if the retrieval operation failed, or nil if successful.
func (s *GradeService) Get(gradeID uint) (*models.Grade, error) {
	var grade models.Grade
	if err := s.db.Preload("Submission.Assignment").
		Preload("Submission.User").
		Preload("GradedByUser").
		First(&grade, gradeID).Error; err != nil {
		return nil, err
	}
	return &grade, nil
}

// Update updates an existing grade in the database. The grade is identified by the gradeID parameter, and the
// pointsEarned and feedback fields are updated. The function returns the updated grade and an error if the update
// operation fails.
//
// Parameters:
//   - gradeID: The ID of the grade to update.
//   - pointsEarned: The updated number of points earned by the submission.
//   - feedback: The updated feedback for the submission.
//
// Returns:
//   - *models.Grade: A pointer to the updated grade, or nil if there was an error.
//   - error: An error if the update operation failed, or nil if successful.
func (s *GradeService) Update(gradeID uint, pointsEarned float64, feedback string) (*models.Grade, error) {
	var grade models.Grade
	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.First(&grade, gradeID).Error; err != nil {
			return err
		}
		grade.PointsEarned = pointsEarned
		grade.Feedback = feedback
		grade.GradedAt = time.Now()
		return tx.Save(&grade).Error
	})

	if err != nil {
		return nil, err
	}

	return &grade, nil
}

// Delete deletes a grade from the database by its ID.
// It takes a grade ID as an argument and returns an error if the deletion operation fails.
//
// Parameters:
//   - gradeID: The ID of the grade to be deleted.
//
// Returns:
//   - error: An error if the deletion operation failed, or nil if successful.
func (s *GradeService) Delete(gradeID uint) error {
	var grade models.Grade
	err := s.db.First(&grade, gradeID).Error
	if err != nil {
		return err
	}
	return s.db.Delete(&grade).Error
}

// GradesForUser retrieves all grades for a specific user.
// It expects a user ID as a parameter and returns a list of grades associated with that user.
// The function also preloads the related submission, submission's assignment, and the user who graded the submission.
//
// Parameters:
//   - userID: The ID of the user.
//
// Returns:
//   - []models.Grade: A list of grades associated with the user.
//   - error: An error if the retrieval operation fails, or nil if successful.
func (s *GradeService) GradesForUser(userID uint) ([]models.Grade, error) {
	var grades []models.Grade
	err := s.db.Joins("JOIN submissions ON submissions.id = grades.submission_id").
		Where("submissions.user_id = ?", userID).
		Preload("Submission.Assignment").
		Preload("GradedByUser").
		Find(&grades).Error
	return grades, err
}

// GradeStatistics retrieves statistical information about grades for a specific assignment.
// The function takes an assignment ID as a parameter and returns the average, maximum, and minimum points earned
// for all grades associated with that assignment. If there is an error retrieving the statistics, the function
// returns an error.
//
// Parameters:
//   - assignmentID: The ID of the assignment for which to retrieve grade statistics.
//
// Returns:
//   - *GradeStats: A pointer to a GradeStats struct containing the average, maximum, and minimum points earned
//     for all grades associated with the assignment.
//   - error: An error if there was a problem retrieving the grade statistics, or nil if successful.
func (s *GradeService) GradeStatistics(assignmentID uint) (*GradeStats, error) {
	var stats struct {
		AvgPoints float64
		MaxPoints float64
		MinPoints float64
	}

	err := s.db.Table("grades").
		Joins("JOIN submissions ON submissions.id = grades.submission_id").
		Where("submissions.assignment_id = ?", assignmentID).
		Select("AVG(points_earned) as avg_points, MAX(points_earned) as max_points, MIN(points_earned) as min_points").
		Scan(&stats).Error

	if err != nil {
		return nil, err
	}

	return &GradeStats{
		AvgPoints: stats.AvgPoints,
		MaxPoints: stats.MaxPoints,
		MinPoints: stats.MinPoints,
	}, nil
}

// GradesForAssignment retrieves all grades for a specific assignment.
// It expects an assignment ID as a parameter and returns a list of grades associated with that assignment.
// The function also preloads the related submission, submission's user, and the user who graded the submission.
//
// Parameters:
//   - assignmentID: The ID of the assignment.
//
// Returns:
//   - []models.Grade: A list of grades associated with the assignment.
//   - error: An error if the retrieval operation fails, or nil if successful.
func (s *GradeService) GradesForAssignment(assignmentID uint) ([]models.Grade, error) {
	var grades []models.Grade
	err := s.db.Joins("JOIN submissions ON submissions.id = grades.submission_id").
		Where("submissions.assignment_id = ?", assignmentID).
		Preload("Submission.User").
		Preload("GradedByUser").
		Find(&grades).Error
	return grades, err
}
