package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	FirstName   string       `json:"firstName" gorm:"not null" binding:"required,min=2,max=50"`
	LastName    string       `json:"lastName" gorm:"not null" binding:"required,min=2,max=50"`
	Email       string       `json:"email" gorm:"uniqueIndex;not null" binding:"required,email"`
	Password    string       `json:"-" gorm:"not null" binding:"required,min=8,max=72"` // The "-" ensures this field is not serialized to JSON
	DateOfBirth time.Time    `json:"dateOfBirth" binding:"omitempty"`
	ProfilePic  string       `json:"profilePic" binding:"omitempty,url"`
	Bio         string       `json:"bio" binding:"omitempty,max=500"`
	Active      bool         `json:"active" gorm:"default:true"`
	Enrollments []Enrollment `json:"enrollments" gorm:"foreignKey:UserID"`
}

// BeforeSave is a GORM hook that hashes the user's password before saving to the database
// It only hashes if the password is not already a bcrypt hash
func (u *User) BeforeSave(db *gorm.DB) error {
	if u.Password != "" && !u.isPasswordHashed() {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		u.Password = string(hashedPassword)
	}
	return nil
}

// isPasswordHashed checks if the password is already a bcrypt hash
// bcrypt hashes always start with $2a$, $2b$, or $2y$ and are 60 characters long
func (u *User) isPasswordHashed() bool {
	if len(u.Password) != 60 {
		return false
	}
	return len(u.Password) == 60 &&
		(u.Password[:4] == "$2a$" || u.Password[:4] == "$2b$" || u.Password[:4] == "$2y$")
}

// CheckPassword compares the provided password with the user's stored password hash
func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}
