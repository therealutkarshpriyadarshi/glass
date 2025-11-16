package tests

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"server/app/handlers"
	"server/app/middlewares"
	"server/app/models"
	"server/tests/setup"

	"github.com/stretchr/testify/require"

	"server/app/services"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

const (
	secret           = "test_secret"
	testUserEmail    = "newuser@example.com"
	testUserPassword = "password123"
	newPassword      = "newpassword123"
)

func setupUserTestRouter(db *gorm.DB) (*gin.Engine, *services.UserService) {
	r := gin.Default()
	expiration := time.Hour * 24

	userService := services.NewUserService(db, []byte(secret), expiration)
	userHandler := handlers.NewUserHandler(userService)

	r.POST("/users/register", userHandler.Register)
	r.POST("/users/login", userHandler.Login)

	authorized := r.Group("/users")
	authorized.Use(middlewares.AuthMiddleware(secret))
	{
		authorized.GET("/profile", userHandler.GetProfile)
		authorized.PUT("/profile", userHandler.UpdateProfile)
		authorized.DELETE("/profile", userHandler.DeleteUser)
		authorized.POST("/change-password", userHandler.ChangePassword)
	}

	return r, userService
}

func TestUserRoutes(t *testing.T) {
	db, err := setup.SetupTestDB(context.Background(), &models.User{})
	require.NoError(t, err, "Failed to set up test database")
	defer setup.CleanupTestDB(context.Background())

	router, userService := setupUserTestRouter(db)

	t.Run("RegisterUser", func(t *testing.T) {
		userData := map[string]interface{}{
			"email":    testUserEmail,
			"password": testUserPassword,
		}
		body, _ := json.Marshal(userData)
		req, _ := http.NewRequest("POST", "/users/register", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)
		assert.Contains(t, w.Body.String(), "User created successfully")
	})

	t.Run("LoginUser", func(t *testing.T) {
		loginData := map[string]interface{}{
			"email":    "newuser@example.com",
			"password": "password123",
		}
		body, _ := json.Marshal(loginData)
		req, _ := http.NewRequest("POST", "/users/login", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)

		require.NoError(t, err)
		assert.NotEmpty(t, response["token"])
	})

	t.Run("GetProfile", func(t *testing.T) {
		token, _ := loginUser(userService, testUserEmail, testUserPassword)
		req, _ := http.NewRequest("GET", "/users/profile", nil)
		req.Header.Set("Authorization", "Bearer "+token)

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		user := response["user"].(map[string]interface{})
		assert.Equal(t, testUserEmail, user["email"])
	})

	t.Run("UpdateProfile", func(t *testing.T) {
		token, _ := loginUser(userService, testUserEmail, testUserPassword)
		updateData := map[string]interface{}{
			"firstName": "John",
			"lastName":  "Doe",
		}
		body, _ := json.Marshal(updateData)
		req, _ := http.NewRequest("PUT", "/users/profile", bytes.NewBuffer(body))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)
		assert.Equal(t, "John", response["firstName"])
		assert.Equal(t, "Doe", response["lastName"])
	})

	t.Run("ChangePassword", func(t *testing.T) {
		token, _ := loginUser(userService, testUserEmail, testUserPassword)
		changePasswordData := map[string]interface{}{
			"oldPassword": testUserPassword,
			"newPassword": newPassword,
		}
		body, _ := json.Marshal(changePasswordData)
		req, _ := http.NewRequest("POST", "/users/change-password", bytes.NewBuffer(body))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), "Password changed successfully")

		// Try logging in with new password
		_, err := loginUser(userService, testUserEmail, newPassword)
		assert.NoError(t, err)
	})

	t.Run("DeleteUser", func(t *testing.T) {
		token, _ := loginUser(userService, testUserEmail, newPassword)
		req, _ := http.NewRequest("DELETE", "/users/profile", nil)
		req.Header.Set("Authorization", "Bearer "+token)

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), "User deleted successfully")

		// Try logging in with deleted user
		_, err := loginUser(userService, testUserEmail, newPassword)
		assert.Error(t, err)
	})
}

func loginUser(userService *services.UserService, email, password string) (string, error) {
	token, err := userService.AuthenticateUser(email, password)
	if err != nil {
		return "", fmt.Errorf("failed to authenticate user: %v", err)
	}
	return token, nil
}
