package handlers

import (
	"net/http"
	"server/app/models"
	"server/app/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

// UserHandler handles HTTP requests related to user operations
type UserHandler struct {
	serv *services.UserService
}

func NewUserHandler(serv *services.UserService) *UserHandler {
	return &UserHandler{
		serv: serv,
	}
}

// Register handles user registration
// It binds the JSON request to a RegisterRequest and creates a new user
func (h *UserHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	user := models.User{
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Email:     req.Email,
		Password:  req.Password,
	}

	if err := h.serv.CreateUser(&user); err != nil {
		SendError(err, c)
		return
	}

	// Authenticate the user and generate a token
	token, err := h.serv.AuthenticateUser(user.Email, req.Password)
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"user":  user,
		"token": token,
	})
}

// Login handles user authentication
// It validates user credentials and returns a JWT token upon successful login
func (h *UserHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	token, err := h.serv.AuthenticateUser(req.Email, req.Password)
	if err != nil {
		SendError(err, c)
		return
	}

	// Get user details to return with token
	user, err := h.serv.GetUserByEmail(req.Email)
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user":  user,
		"token": token,
	})
}

// GetProfile retrieves the user profile for the authenticated user
func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, _ := c.Get("userID")
	user, err := h.serv.GetUserByID(userID.(uint))
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

// UpdateProfile updates the user profile for the authenticated user
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID := GetUserID(c)
	user, err := h.serv.GetUserByID(userID)
	if err != nil {
		HandleNotFound(c, "User not found")
		return
	}

	if err := c.ShouldBindJSON(user); err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	if err := h.serv.UpdateUser(user); err != nil {
		SendError(err, c)
		return
	}

	c.JSON(http.StatusOK, user)
}

// DeleteUser deletes a user by their ID
func (h *UserHandler) DeleteUser(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		HandleBadRequest(c, InvalidUserID)
		return
	}

	if err := h.serv.DeleteUser(uint(userID)); err != nil {
		SendError(err, c)
		return
	}

	HandleDeleted(c, "User deleted successfully")
}

// ChangePassword changes the password for the authenticated user
func (h *UserHandler) ChangePassword(c *gin.Context) {
	userID := GetUserID(c)
	var req models.ChangePasswordRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	if err := h.serv.ChangePassword(userID, req.OldPassword, req.NewPassword); err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	HandleOk(c, "Password changed successfully")
}

// GetEnrolledCourses retrieves all courses the authenticated user is enrolled in
func (h *UserHandler) GetEnrolledCourses(c *gin.Context) {
	userID := GetUserID(c)
	courses, err := h.serv.GetEnrolledCourses(userID)
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(http.StatusOK, gin.H{"courses": courses})
}

// GetCreatedCourses retrieves all courses created by the authenticated user
func (h *UserHandler) GetCreatedCourses(c *gin.Context) {
	userID := GetUserID(c)
	courses, err := h.serv.GetCreatedCourses(userID)
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(http.StatusOK, gin.H{"courses": courses})
}
