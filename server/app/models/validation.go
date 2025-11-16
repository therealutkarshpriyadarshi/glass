package models

// RegisterRequest represents the request body for user registration
type RegisterRequest struct {
	FirstName   string `json:"firstName" binding:"required,min=2,max=50"`
	LastName    string `json:"lastName" binding:"required,min=2,max=50"`
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=8,max=72"`
	DateOfBirth string `json:"dateOfBirth" binding:"omitempty"`
}

// LoginRequest represents the request body for user login
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

// UpdateProfileRequest represents the request body for updating user profile
type UpdateProfileRequest struct {
	FirstName   string `json:"firstName" binding:"omitempty,min=2,max=50"`
	LastName    string `json:"lastName" binding:"omitempty,min=2,max=50"`
	ProfilePic  string `json:"profilePic" binding:"omitempty,url"`
	Bio         string `json:"bio" binding:"omitempty,max=500"`
	DateOfBirth string `json:"dateOfBirth" binding:"omitempty"`
}

// ChangePasswordRequest represents the request body for changing password
type ChangePasswordRequest struct {
	OldPassword string `json:"oldPassword" binding:"required,min=8"`
	NewPassword string `json:"newPassword" binding:"required,min=8,max=72"`
}
