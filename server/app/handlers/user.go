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
// It binds the JSON request to a User model and creates a new user
func (h *UserHandler) Register(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	if err := h.serv.CreateUser(&user); err != nil {
		SendError(err, c)
		return
	}

	HandleCreated(c, "User created successfully")
}

// Login handles user authentication
// It validates user credentials and returns a JWT token upon successful login
func (h *UserHandler) Login(c *gin.Context) {
	var loginData struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&loginData); err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	token, err := h.serv.AuthenticateUser(loginData.Email, loginData.Password)
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token})
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
	var passwordData struct {
		OldPassword string `json:"oldPassword" binding:"required"`
		NewPassword string `json:"newPassword" binding:"required"`
	}

	if err := c.ShouldBindJSON(&passwordData); err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	oldP := passwordData.OldPassword
	newP := passwordData.NewPassword
	if err := h.serv.ChangePassword(userID, oldP, newP); err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	HandleOk(c, "Password changed successfully")
}
