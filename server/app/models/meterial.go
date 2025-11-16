package models

import (
	"gorm.io/gorm"
)

type Material struct {
	gorm.Model
	Title       string         `json:"title" gorm:"not null"`
	Description string         `json:"description" gorm:"type:text"`
	CourseId    uint           `json:"courseId" gorm:"not null"`
	Course      Course         `json:"course" gorm:"foreignKey:CourseId"`
	Files       []MaterialFile `json:"files" gorm:"foreignKey:MaterialId"`
}

func (m Material) TableName() string {
	return "materials"
}
