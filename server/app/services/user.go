package services

import (
	"errors"
	apperror "server/app/error"
	"server/app/models"
	"time"

	"github.com/dgrijalva/jwt-go"
	"gorm.io/gorm"
)

// UserService handles user-related operations and authentication.
type UserService struct {
	db          *gorm.DB
	jwtSecret   []byte
	tokenExpiry time.Duration
}

// NewUserService creates a new UserService instance.
func NewUserService(db *gorm.DB, jwtSecret []byte, tokenExpiry time.Duration) *UserService {
	return &UserService{
		db:          db,
		jwtSecret:   jwtSecret,
		tokenExpiry: tokenExpiry,
	}
}

// CreateUser creates a new user in the database.
func (s *UserService) CreateUser(user *models.User) error {
	return s.db.Create(user).Error
}

// GetUserByID retrieves a user by their ID.
func (s *UserService) GetUserByID(id uint) (*models.User, error) {
	var user models.User
	if err := s.db.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUserByEmail retrieves a user by their email address.
func (s *UserService) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := s.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// UpdateUser updates an existing user in the database.
func (s *UserService) UpdateUser(user *models.User) error {
	return s.db.Save(user).Error
}

// DeleteUser removes a user from the database by their ID.
func (s *UserService) DeleteUser(id uint) error {
	return s.db.Delete(&models.User{}, id).Error
}

// AuthenticateUser authenticates a user and returns a JWT token if successful.
func (s *UserService) AuthenticateUser(email, password string) (string, error) {
	user, err := s.GetUserByEmail(email)
	if err != nil {
		return "", err
	}

	if !user.CheckPassword(password) {
		return "", apperror.InvalidCredential{}
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(s.tokenExpiry).Unix(),
	})

	tokenString, err := token.SignedString(s.jwtSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// VerifyToken verifies the validity of a JWT token.
func (s *UserService) VerifyToken(tokenString string) (*jwt.Token, error) {
	return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, apperror.SigningMethodError{}
		}
		return s.jwtSecret, nil
	})
}

// GetUserFromToken extracts the user information from a verified JWT token.
func (s *UserService) GetUserFromToken(token *jwt.Token) (*models.User, error) {
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, apperror.InvalidToken{}
	}
	userID := uint(claims["user_id"].(float64))
	return s.GetUserByID(userID)
}

// ChangePassword changes a user's password after verifying the old password.
func (s *UserService) ChangePassword(userID uint, oldPassword, newPassword string) error {
	user, err := s.GetUserByID(userID)
	if err != nil {
		return err
	}

	if !user.CheckPassword(oldPassword) {
		return errors.New("invalid old password")
	}

	user.Password = newPassword
	return s.UpdateUser(user)
}
