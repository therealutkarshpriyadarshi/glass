package models

import (
	"time"

	"gorm.io/gorm"
)

type Grade struct {
	gorm.Model
	SubmissionID uint       `json:"submissionId" gorm:"not null"`
	Submission   Submission `json:"-" gorm:"foreignkey:SubmissionID"`
	GradedBy     uint       `json:"gradedBy" gorm:"not null"`
	GradedByUser User       `json:"gradedByUser" gorm:"foreignkey:GradedBy"`
	PointsEarned float64    `json:"pointsEarned" gorm:"not null"`
	Feedback     string     `json:"feedback" gorm:"type:text"`
	GradedAt     time.Time  `json:"gradedAt" gorm:"not null"`
}

func (Grade) TableName() string {
	return "grades"
}
