package models

import "gorm.io/gorm"

type Role string

const (
	RoleStudent Role = "student"
	RoleTeacher Role = "teacher"
	RoleAdmin   Role = "admin"
)

func (r Role) String() string {
	return string(r)
}

type EnrollmentStatus string

const (
	EnrollmentStatusPending  EnrollmentStatus = "pending"
	EnrollmentStatusApproved EnrollmentStatus = "approved"
	EnrollmentStatusRejected EnrollmentStatus = "rejected"
)

func (e EnrollmentStatus) String() string {
	return string(e)
}

// Enrollment represents the many-to-many relationship between Course and User
type Enrollment struct {
	gorm.Model
	UserID   uint             `json:"userId" gorm:"not null"`
	User     User             `json:"-" gorm:"foreignkey:UserID"`
	CourseID uint             `json:"courseId" gorm:"not null"`
	Course   Course           `json:"-" gorm:"foreignkey:CourseID"`
	Role     Role             `json:"role" gorm:"not null"`
	Status   EnrollmentStatus `json:"status" gorm:"not null;default:'pending'"`
}
