package services

import (
	"errors"
	"gorm.io/gorm"
	"server/app/models"
	"time"
)

type AssignmentService struct {
	db *gorm.DB
}

func NewAssignmentService(db *gorm.DB) *AssignmentService {
	return &AssignmentService{db: db}
}

func (s *AssignmentService) Get(id uint) (*models.Assignment, error) {
	var assignment models.Assignment
	if err := s.db.Preload("Course").
		Preload("Submissions").
		First(&assignment, id).Error; err != nil {
		return nil, err
	}
	return &assignment, nil
}

func (s *AssignmentService) Create(assignment *models.Assignment) error {
	if err := s.db.Create(assignment).Error; err != nil {
		return err
	}
	return nil
}

func (s *AssignmentService) Update(a *models.Assignment) error {
	return s.db.Save(a).Error
}

func (s *AssignmentService) Delete(id uint) error {
	return s.db.Delete(&models.Assignment{}, id).Error
}

func (s *AssignmentService) GetAssignmentsForCourse(courseID uint) ([]models.Assignment, error) {
	var assignments []models.Assignment
	if err := s.db.Where("course_id = ?", courseID).Find(&assignments).Error; err != nil {
		return nil, err
	}
	return assignments, nil
}

func (s *AssignmentService) Publish(id uint) error {
	assignment, err := s.Get(id)
	if err != nil {
		return err
	}

	now := time.Now()
	assignment.IsPublished = true
	assignment.PublishDate = &now

	return s.Update(assignment)
}

func (s *AssignmentService) Unpublish(id uint) error {
	assignment, err := s.Get(id)
	if err != nil {
		return err
	}

	assignment.IsPublished = false
	assignment.PublishDate = nil

	return s.Update(assignment)
}

func (s *AssignmentService) GetUpcomingAssignments(userID uint, limit int) ([]models.Assignment, error) {
	var assignments []models.Assignment
	err := s.db.Joins("JOIN course_enrollments ON course_enrollments.course_id = assignments.course_id").
		Where("course_enrollments.user_id = ? AND assignments.due_date > ? AND assignments.is_published = ?", userID, time.Now(), true).
		Order("assignments.due_date ASC").
		Limit(limit).
		Find(&assignments).Error
	return assignments, err
}

func (s *AssignmentService) GetOverdueAssignments(userID uint) ([]models.Assignment, error) {
	var assignments []models.Assignment
	err := s.db.Joins("JOIN course_enrollments ON course_enrollments.course_id = assignments.course_id").
		Joins("LEFT JOIN submissions ON submissions.assignment_id = assignments.id AND submissions.user_id = ?", userID).
		Where("course_enrollments.user_id = ? AND assignments.due_date < ? AND assignments.is_published = ? AND submissions.id IS NULL", userID, time.Now(), true).
		Find(&assignments).Error
	return assignments, err
}

func (s *AssignmentService) GetAssignmentCompletion(assignmentID uint) (float64, error) {
	var assignment models.Assignment
	if err := s.db.Preload("Course.Enrollments").Preload("Submissions").First(&assignment, assignmentID).Error; err != nil {
		return 0, err
	}

	totalStudents := len(assignment.Course.Enrollments)
	submittedAssignments := len(assignment.Submissions)

	if totalStudents == 0 {
		return 0, errors.New("no students enrolled in the course")
	}

	return float64(submittedAssignments) / float64(totalStudents) * 100, nil
}
