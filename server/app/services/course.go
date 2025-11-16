package services

import (
	"server/app/models"

	"gorm.io/gorm"
)

type CourseService struct {
	db *gorm.DB
}

// NewCourseService creates a new CourseService instance.
//
// db is a pointer to a gorm.DB object that will be used to interact with the
// database.
//
// Returns:
//   - *CourseService: A pointer to a CourseService instance.
func NewCourseService(db *gorm.DB) *CourseService {
	return &CourseService{db: db}
}

func (s *CourseService) CreateCourse(c *models.Course) error {
	return s.db.Create(c).Error
}

func (s *CourseService) GetCourse() ([]models.Course, error) {
	var courses []models.Course
	err := s.db.Find(&courses).Error
	return courses, err
}

// GetCourseByID retrieves a course by its ID
//
// Returns:
//   - *models.Course: A pointer to the course with the given ID
//   - error: An error if the course is not found, nil otherwise
func (s *CourseService) GetCourseByID(id uint) (*models.Course, error) {
	var course models.Course
	err := s.db.First(&course, id).Error
	return &course, err
}

// UpdateCourse updates an existing course in the database
//
// Parameters:
//   - c: A pointer to the models.Course object containing the updated information
//
// Returns:
//   - error: An error if the update operation fails, nil otherwise
func (s *CourseService) UpdateCourse(c *models.Course) error {
	result := s.db.Model(c).Updates(models.Course{
		Name:        c.Name,
		Description: c.Description,
		StartDate:   c.StartDate,
		EndDate:     c.EndDate,
		MaxStudents: c.MaxStudents,
		Difficulty:  c.Difficulty,
		Category:    c.Category,
		IsActive:    c.IsActive,
	})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

// DeleteCourse deletes a course from the database by its ID
//
// Parameters:
//   - id: The ID of the course to be deleted
//
// Returns:
//   - error: An error if the deletion operation fails, nil otherwise
func (s *CourseService) DeleteCourse(id uint) error {
	result := s.db.Delete(&models.Course{}, id)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}
