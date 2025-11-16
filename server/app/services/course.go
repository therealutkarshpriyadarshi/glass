package services

import (
	"crypto/rand"
	"math/big"
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

// generateInvitationCode generates a random 8-character alphanumeric invitation code
// Uses characters that are easy to distinguish (no 0/O, 1/I/l)
func generateInvitationCode() (string, error) {
	const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	const codeLength = 8

	code := make([]byte, codeLength)
	for i := range code {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			return "", err
		}
		code[i] = charset[num.Int64()]
	}

	return string(code), nil
}

// GenerateInvitationCode generates and assigns a new unique invitation code to a course
//
// Parameters:
//   - courseID: The ID of the course to generate an invitation code for
//
// Returns:
//   - string: The generated invitation code
//   - error: An error if the operation fails, nil otherwise
func (s *CourseService) GenerateInvitationCode(courseID uint) (string, error) {
	course, err := s.GetCourseByID(courseID)
	if err != nil {
		return "", err
	}

	// Generate unique code with retry logic
	var code string
	maxRetries := 10
	for i := 0; i < maxRetries; i++ {
		code, err = generateInvitationCode()
		if err != nil {
			return "", err
		}

		// Check if code is unique
		var existing models.Course
		err = s.db.Where("invitation_code = ?", code).First(&existing).Error
		if err == gorm.ErrRecordNotFound {
			// Code is unique, break the loop
			break
		} else if err != nil {
			// Database error
			return "", err
		}
		// Code exists, retry
	}

	// Update course with new code
	course.InvitationCode = code
	if err := s.db.Model(course).Update("invitation_code", code).Error; err != nil {
		return "", err
	}

	return code, nil
}

// GetCourseStudents retrieves all students enrolled in a course
//
// Parameters:
//   - courseID: The ID of the course
//
// Returns:
//   - []models.Enrollment: A slice of enrollments with user information preloaded
//   - error: An error if the operation fails, nil otherwise
func (s *CourseService) GetCourseStudents(courseID uint) ([]models.Enrollment, error) {
	var enrollments []models.Enrollment
	err := s.db.Where("course_id = ? AND status = ?", courseID, models.EnrollmentStatusApproved).
		Preload("User").
		Find(&enrollments).Error
	if err != nil {
		return nil, err
	}
	return enrollments, nil
}
