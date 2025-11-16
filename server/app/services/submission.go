package services

import (
	"errors"
	"fmt"
	"mime/multipart"
	"server/app/firebase"
	"server/app/models"
	"time"

	"gorm.io/gorm"
)

type SubmissionService struct {
	db        *gorm.DB
	firestore *firebase.CloudStorage
}

func NewSubmissionService(db *gorm.DB, firestore *firebase.CloudStorage) *SubmissionService {
	return &SubmissionService{db, firestore}
}

// CreateSubmission creates a new submission for a given assignment by a user.
//
// Parameters:
//   - userID: The ID of the user creating the submission.
//   - assignmentID: The ID of the assignment being submitted.
//   - files: A slice of multipart.FileHeader pointers representing the files to be uploaded.
//
// Returns:
//   - *models.Submission: A pointer to the created Submission model.
//   - error: An error if the submission creation fails, nil otherwise.
func (s *SubmissionService) CreateSubmission(userID, assignmentID uint, files []*multipart.FileHeader) (*models.Submission, error) {
	if ok, err := s.userCanSubmit(userID, assignmentID); !ok || err != nil {
		return nil, err
	}

	var assignment models.Assignment
	if err := s.db.First(&assignment, assignmentID).Error; err != nil {
		return nil, EntityNotFound(err)
	}

	sub := models.Submission{
		AssignmentID: assignmentID,
		UserID:       userID,
		SubmittedAt:  time.Now(),
		Status:       models.SubmissionStatusSubmitted,
	}

	if sub.SubmittedAt.After(assignment.DueDate) {
		sub.Status = models.SubmissionStatusLate
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&sub).Error; err != nil {
			return err
		}

		for _, file := range files {
			options := FileOptions{
				Path: "submissions/",
			}
			baseFile, err := UploadFile(s.firestore, file, options)
			if err != nil {
				return err
			}

			subFile := models.SubmissionFile{
				SubmissionId: sub.ID,
				BaseFile:     baseFile,
			}

			if err := tx.Create(&subFile).Error; err != nil {
				return CreateEntityFailure(err)
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &sub, nil
}

// userCanSubmit checks if a user is allowed to submit an assignment.
//
// Parameters:
//   - userId: The ID of the user attempting to submit.
//   - assignmentId: The ID of the assignment being submitted.
//
// Returns:
//   - bool: True if the user can submit, false otherwise.
//   - error: An error if any occurred during the check, nil otherwise.
func (s *SubmissionService) userCanSubmit(userId, assignmentId uint) (bool, error) {
	var canSubmit bool

	err := s.db.Transaction(func(tx *gorm.DB) error {
		var assignment models.Assignment
		if err := tx.Where("id = ?", assignmentId).First(&assignment).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return EntityNotFound(err)
			}
			return err
		}

		var enrollment models.Enrollment
		courseId := assignment.CourseID
		if err := tx.Where("user_id = ? AND course_id = ?", userId, courseId).First(&enrollment).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return EntityNotFound(err)
			}
			return err
		}

		if enrollment.Role != models.RoleStudent {
			return PermissionDenied()
		}

		if enrollment.Status != models.EnrollmentStatusApproved {
			return PermissionDenied()
		}

		canSubmit = true
		return nil
	})

	if err != nil {
		return false, err
	}

	return canSubmit, nil
}

// GetSubmission retrieves a submission by its ID, including associated files and grade.
//
// Parameters:
//   - submissionID: The unique identifier of the submission to retrieve.
//
// Returns:
//   - *models.Submission: A pointer to the retrieved submission if found.
//   - error: An error if any occurred during the retrieval process, nil otherwise.
//
// Possible errors:
//   - gorm.ErrRecordNotFound: If no submission with the given ID exists.
//   - Other database-related errors.
func (s *SubmissionService) GetSubmission(submissionID uint) (*models.Submission, error) {
	var submission models.Submission

	result := s.db.
		Preload("Files").
		Preload("Grade").
		First(&submission, submissionID)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("submission with ID %d not found: %w", submissionID, result.Error)
		}
		return nil, fmt.Errorf("error retrieving submission: %w", result.Error)
	}

	return &submission, nil
}

// DeleteSubmission deletes a submission and its associated files from the database and storage.
//
// Parameters:
//   - submissionID: The unique identifier of the submission to delete.
//
// Returns:
//   - error: An error if the deletion process fails, nil otherwise.
//
// Possible errors:
//   - If the submission is not found.
//   - If the submission is already graded.
//   - If there's an error deleting files from storage or the database.
func (s *SubmissionService) DeleteSubmission(submissionID uint) error {
	sub, err := s.GetSubmission(submissionID)
	if err != nil {
		return err
	}

	if sub.Status == models.SubmissionStatusGraded {
		return errors.New("cannot delete a graded submission")
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		files := make([]models.BaseFile, len(sub.Files))
		for _, file := range sub.Files {
			files = append(files, file.BaseFile)
		}

		if err := DeleteFiles(s.firestore, files); err != nil {
			return err
		}

		for _, file := range sub.Files {
			if err := tx.Delete(&file).Error; err != nil {
				return DeleteEntityFailure(err)
			}
		}

		if err := tx.Delete(sub).Error; err != nil {
			return DeleteEntityFailure(err)
		}

		return nil
	})
}

// GradeSubmission grades a submission by creating a new grade and updating the submission status.
//
// Parameters:
//   - submissionID: The unique identifier of the submission to grade.
//   - gradedBy: The unique identifier of the user grading the submission.
//   - score: The score given to the submission.
//   - feedback: The feedback provided for the submission.
//
// Returns:
//   - *models.Grade: A pointer to the newly created grade if successful, nil otherwise.
//   - error: An error if the grading process fails, nil otherwise.
//
// Possible errors:
//   - If the submission is not found.
//   - If there's an error creating the grade or updating the submission status in the database.
func (s *SubmissionService) GradeSubmission(submissionID, gradedBy uint, score float64, feedback string) (*models.Grade, error) {
	submission, err := s.GetSubmission(submissionID)
	if err != nil {
		return nil, err
	}

	grade := models.Grade{
		SubmissionID: submissionID,
		GradedBy:     gradedBy,
		PointsEarned: score,
		Feedback:     feedback,
		GradedAt:     time.Now(),
	}

	err = s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&grade).Error; err != nil {
			return err
		}

		submission.Status = models.SubmissionStatusGraded
		return tx.Save(submission).Error
	})

	if err != nil {
		return nil, err
	}

	return &grade, nil
}

// CanSeeSubmission checks if a user has permission to view a specific submission.
//
// Parameters:
//   - userID: The ID of the user attempting to view the submission.
//   - submissionID: The ID of the submission being accessed.
//
// Returns:
//   - bool: True if the user can see the submission, false otherwise.
//   - error: An error if the database query fails, nil otherwise.
//
// The function allows access if:
//  1. The user is the owner of the submission.
//  2. The user is an admin or teacher for the course associated with the submission.
//
// Possible errors:
//   - If the submission is not found in the database.
//   - If there's an error querying the database for enrollment information.
func (s *SubmissionService) CanSeeSubmission(userID, submissionID uint) (bool, error) {
	var submission models.Submission
	err := s.db.Preload("Assignment.Course").First(&submission, submissionID).Error
	if err != nil {
		return false, err
	}

	if submission.UserID == userID {
		return true, nil
	}

	var count int64
	var enrollment models.Enrollment
	roles := []string{
		models.RoleAdmin.String(),
		models.RoleTeacher.String(),
	}

	courseId := submission.Assignment.CourseID
	err = s.db.Model(&enrollment).
		Where("user_id = ? AND course_id = ? AND role IN ?", userID, courseId, roles).
		Count(&count).Error
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// GetSubmissionsForAssignment retrieves all submissions for a given assignment.
//
// Parameters:
//   - assignmentID: The ID of the assignment to retrieve submissions for.
//
// Returns:
//   - []models.Submission: A slice of submissions for the given assignment.
//   - error: An error if the database query fails, nil otherwise.
func (s *SubmissionService) GetSubmissionsForAssignment(assignmentID uint) ([]models.Submission, error) {
	var submissions []models.Submission
	if err := s.db.Where("assignment_id = ?", assignmentID).
		Preload("Files").
		Preload("Grade").
		Find(&submissions).Error; err != nil {
		return nil, err
	}
	return submissions, nil
}

// UpdateSubmission updates an existing submission with new files.
//
// Parameters:
//   - submissionID: The ID of the submission to update.
//   - files: A slice of multipart.FileHeader pointers representing the new files to be uploaded.
//
// Returns:
//   - *models.Submission: A pointer to the updated Submission model.
//   - error: An error if the submission update fails, nil otherwise.
//
// Possible errors:
//   - If the submission is not found.
//   - If the submission is already graded.
//   - If there's an error uploading files or updating the database.
func (s *SubmissionService) UpdateSubmission(submissionID uint, files []*multipart.FileHeader) (*models.Submission, error) {
	submission, err := s.GetSubmission(submissionID)
	if err != nil {
		return nil, err
	}

	if submission.Status == models.SubmissionStatusGraded {
		return nil, CannotPerformAction("update a graded submission")
	}

	err = s.db.Transaction(func(tx *gorm.DB) error {
		for _, file := range files {
			options := FileOptions{
				Path: fmt.Sprintf("submissions/%d", submission.ID),
			}
			baseFile, err := UploadFile(s.firestore, file, options)
			if err != nil {
				return err
			}

			submissionFile := models.SubmissionFile{
				SubmissionId: submission.ID,
				BaseFile:     baseFile,
			}

			if err := tx.Create(&submissionFile).Error; err != nil {
				return CreateEntityFailure(err)
			}
		}

		submission.SubmittedAt = time.Now()
		submission.Status = models.SubmissionStatusSubmitted

		return tx.Save(submission).Error
	})

	if err != nil {
		return nil, err
	}

	return submission, nil
}
