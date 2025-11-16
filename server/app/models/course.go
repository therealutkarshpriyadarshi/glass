package models

import "gorm.io/gorm"

type Course struct {
	gorm.Model
	Name           string       `json:"name" gorm:"not null"`
	Description    string       `json:"description"`
	CreatorID      uint         `json:"creator_id" gorm:"not null"`
	Creator        User         `json:"creator" gorm:"foreignKey:CreatorID"`
	StartDate      string       `json:"start_date"`
	EndDate        string       `json:"end_date"`
	MaxStudents    int          `json:"max_students"`
	Difficulty     string       `json:"difficulty"`
	Category       string       `json:"category"`
	IsActive       bool         `json:"is_active"`
	InvitationCode string       `json:"invitation_code" gorm:"unique"`
	Enrollments    []Enrollment `json:"enrollments" gorm:"foreignKey:CourseID"`
}

func (c *Course) TableName() string {
	return CoursesTable
}
