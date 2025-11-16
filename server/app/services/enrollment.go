package services

import (
	"errors"
	"fmt"
	"server/app/models"

	"gorm.io/gorm"
)

type EnrollmentService struct {
	db *gorm.DB
}

func NewEnrollmentService(db *gorm.DB) *EnrollmentService {
	return &EnrollmentService{db: db}
}

// JoinCourseByCode enrolls a user in a course using an invitation code.
// Initially it sets the enrollment status to pending.
//
// Parameters:
//   - userID: The ID of the user to enroll.
//   - invitationCode: The invitation code for the course.
//   - role: The role the user will have in the course.
//
// Returns:
//   - error: An error if the enrollment process fails, nil otherwise.
func (s *EnrollmentService) JoinCourseByCode(userID uint, invitationCode string, role models.Role) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		var course models.Course
		if err := s.db.Where("invitation_code = ?", invitationCode).First(&course).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("invalid invitation code")
			}
			return err
		}

		enrollment := models.Enrollment{
			UserID:   userID,
			CourseID: course.ID,
			Role:     role,
			Status:   models.EnrollmentStatusPending,
		}

		if err := s.db.Create(&enrollment).Error; err != nil {
			return CreateEntityFailure(err)
		}

		return nil
	})
}

// ApproveEnrolment approves a pending enrollment request for a course.
//
// Parameters:
//   - adminId: The ID of the admin (course creator) approving the enrollment.
//   - enrollmentId: The ID of the enrollment to be approved.
//
// Returns:
//   - error: An error if the approval process fails, nil otherwise.
func (s *EnrollmentService) ApproveEnrolment(adminId, enrollmentId uint) error {
	if adminId == 0 || enrollmentId == 0 {
		return errors.New("invalid input: adminId and enrollmentId must be non-zero")
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		var enrollment models.Enrollment
		if err := tx.Preload(models.CoursesTable).Where("id = ?", enrollmentId).First(&enrollment).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return EntityNotFound(fmt.Errorf("enrollment with id %d not found", enrollmentId))
			}
			return fmt.Errorf("error fetching enrollment: %w", err)
		}

		if enrollment.Course.ID == 0 {
			return errors.New("course information not loaded")
		}

		if adminId != enrollment.Course.CreatorID {
			return errors.New("only course creator can approve enrollments")
		}

		if enrollment.Status != models.EnrollmentStatusPending {
			return fmt.Errorf("cannot approve enrollment with status: %s", enrollment.Status)
		}

		enrollment.Status = models.EnrollmentStatusApproved
		if err := tx.Save(&enrollment).Error; err != nil {
			return UpdateEntityFailure(fmt.Errorf("failed to update enrollment status: %w", err))
		}

		return nil
	})
}

// RejectEnrolment rejects a pending enrollment request for a course.
//
// Parameters:
//   - adminId: The ID of the admin (course creator) rejecting the enrollment.
//   - enrollmentId: The ID of the enrollment to be rejected.
//
// Returns:
//   - error: An error if the rejection process fails, nil otherwise.
func (s *EnrollmentService) RejectEnrolment(adminId, enrollmentId uint) error {
	if adminId == 0 || enrollmentId == 0 {
		return errors.New("invalid input: adminId and enrollmentId must be non-zero")
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		var enrollment models.Enrollment
		if err := tx.Preload(models.CoursesTable).
			Where("id = ?", enrollmentId).
			First(&enrollment).Error; err != nil {

			if errors.Is(err, gorm.ErrRecordNotFound) {
				return EntityNotFound(fmt.Errorf("enrollment with id %d not found", enrollmentId))
			}

			return fmt.Errorf("error fetching enrollment: %w", err)
		}

		ok, err := s.IsAdmin(adminId, enrollment.CourseID)
		if err != nil || !ok {
			return err
		}

		if enrollment.Status != models.EnrollmentStatusPending {
			return fmt.Errorf("cannot reject enrollment with status: %s", enrollment.Status)
		}

		enrollment.Status = models.EnrollmentStatusRejected
		if err := tx.Save(&enrollment).Error; err != nil {
			return UpdateEntityFailure(fmt.Errorf("failed to update enrollment status: %w", err))
		}

		return nil
	})
}

// IsValidRole checks if the given role is valid.
//
// Parameters:
//   - role: The role to be validated.
//
// Returns:
//   - bool: True if the role is valid, false otherwise.
func (s *EnrollmentService) IsValidRole(role string) bool {
	switch role {
	case models.RoleStudent.String(), models.RoleTeacher.String():
		return true
	default:
		return false
	}
}

// GetPendingEnrollments retrieves all pending enrollments for a given course.
//
// Parameters:
//   - courseID: The ID of the course to get pending enrollments for.
//
// Returns:
//   - []models.Enrollment: A slice of pending enrollments.
//   - error: An error if the retrieval process fails, nil otherwise.
func (s *EnrollmentService) GetPendingEnrollments(courseID uint) ([]models.Enrollment, error) {
	var enrollments []models.Enrollment

	if err := s.db.Where("course_id = ? AND status = ?", courseID, models.EnrollmentStatusPending).
		Preload(models.UsersTable).
		Find(&enrollments).Error; err != nil {
		return nil, EntityNotFound(err)
	}

	return enrollments, nil
}

// IsAdmin checks if the given user is the admin (creator) of the specified course.
//
// Parameters:
//   - adminId: The ID of the user to check for admin status.
//   - courseId: The ID of the course to check against.
//
// Returns:
//   - bool: True if the user is the admin of the course, false otherwise.
//   - error: An error if the check fails, nil otherwise. Possible errors include:
//   - EntityNotFoundError: If the course is not found.
//   - PermissionDeniedError: If the user is not the admin of the course.
func (s *EnrollmentService) IsAdmin(adminId, courseId uint) (bool, error) {
	var course models.Course
	if err := s.db.Where("id = ?", courseId).First(&course).Error; err != nil {
		return false, EntityNotFound(err)
	}

	if course.ID == 0 {
		return false, EntityNotFound(fmt.Errorf("course with id %d not found", courseId))
	}

	if adminId != course.CreatorID {
		return false, PermissionDenied()
	}

	return true, nil
}
