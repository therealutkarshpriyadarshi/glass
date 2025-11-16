package models

import (
	"time"

	"gorm.io/gorm"
)

type SubmissionStatus string

const (
	SubmissionStatusDraft     SubmissionStatus = "draft"
	SubmissionStatusSubmitted SubmissionStatus = "submitted"
	SubmissionStatusLate      SubmissionStatus = "late"
	SubmissionStatusGraded    SubmissionStatus = "graded"
)

type Submission struct {
	gorm.Model
	AssignmentID uint             `json:"assignmentId" gorm:"not null"`
	Assignment   Assignment       `json:"-" gorm:"foreignkey:AssignmentID"`
	UserID       uint             `json:"userId" gorm:"not null"`
	User         User             `json:"-" gorm:"foreignkey:UserID"`
	SubmittedAt  time.Time        `json:"submittedAt" gorm:"not null"`
	Files        []SubmissionFile `json:"files" gorm:"foreignKey:SubmissionID"`
	Status       SubmissionStatus `json:"status" gorm:"not null"`
	Grade        *Grade           `json:"grade" gorm:"foreignKey:SubmissionID"`
}

func (s Submission) TableName() string {
	return SubmissionsTable
}
