package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	FirstName   string       `json:"firstName" gorm:"not null"`
	LastName    string       `json:"lastName" gorm:"not null"`
	Email       string       `json:"email" gorm:"uniqueIndex;not null"`
	Password    string       `json:"-" gorm:"not null"` // The "-" ensures this field is not serialized to JSON
	DateOfBirth time.Time    `json:"dateOfBirth"`
	ProfilePic  string       `json:"profilePic"`
	Bio         string       `json:"bio"`
	Active      bool         `json:"active" gorm:"default:true"`
	Enrollments []Enrollment `json:"enrollments" gorm:"foreignKey:UserID"`
}

// BeforeSave is a GORM hook that hashes the user's password before saving to the database
func (u *User) BeforeSave(db *gorm.DB) error {
	if u.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		u.Password = string(hashedPassword)
	}
	return nil
}

// CheckPassword compares the provided password with the user's stored password hash
func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}
