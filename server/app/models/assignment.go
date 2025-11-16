package models

import (
	"time"

	"gorm.io/gorm"
)

type Assignment struct {
	gorm.Model
	CourseID              uint         `json:"courseId" gorm:"not null"`
	Course                Course       `json:"-" gorm:"foreignkey:CourseID"`
	Title                 string       `json:"title" gorm:"not null"`
	DueDate               time.Time    `json:"dueDate" gorm:"not null"`
	Instructions          string       `json:"instructions" gorm:"type:text"`
	AllowedFileExtensions string       `json:"allowedFileExtensions" gorm:"type:text"`
	PublishDate           *time.Time   `json:"publishDate"`
	Submissions           []Submission `json:"submissions"`
	IsPublished           bool         `json:"isPublished" gorm:"default:false"`
}

func (Assignment) TableName() string {
	return "assignments"
}
