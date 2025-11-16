package integration_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"server/app/config"
	"server/app/handlers"
	"server/app/middlewares"
	"server/app/models"
	"server/app/services"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func setupTestRouter(t *testing.T) (*gin.Engine, *gorm.DB) {
	gin.SetMode(gin.TestMode)

	db, err := gorm.Open(postgres.Open("host=localhost user=postgres password=pswrd dbname=glass_test port=5432 sslmode=disable"), &gorm.Config{})
	require.NoError(t, err)

	err = db.AutoMigrate(&models.User{})
	require.NoError(t, err)

	router := gin.New()
	secret := []byte("test-secret-integration")
	expiration := 24 * time.Hour

	userService := services.NewUserService(db, secret, expiration)
	userHandler := handlers.NewUserHandler(userService)

	router.POST("/register", middlewares.AuthRateLimitMiddleware(), userHandler.Register)
	router.POST("/login", middlewares.AuthRateLimitMiddleware(), userHandler.Login)
	router.GET("/profile", middlewares.AuthMiddleware(string(secret)), userHandler.GetProfile)

	return router, db
}

func TestAuthIntegration_Registration(t *testing.T) {
	router, db := setupTestRouter(t)
	defer func() {
		db.Exec("DROP TABLE IF EXISTS users")
	}()

	t.Run("successfully registers user with valid input", func(t *testing.T) {
		payload := map[string]string{
			"firstName": "Integration",
			"lastName":  "Test",
			"email":     "integration@test.com",
			"password":  "SecurePass123!",
		}
		body, _ := json.Marshal(payload)

		req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)
	})

	t.Run("rejects registration with invalid email", func(t *testing.T) {
		payload := map[string]string{
			"firstName": "Invalid",
			"lastName":  "Email",
			"email":     "not-an-email",
			"password":  "SecurePass123!",
		}
		body, _ := json.Marshal(payload)

		req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("rejects registration with weak password", func(t *testing.T) {
		payload := map[string]string{
			"firstName": "Weak",
			"lastName":  "Password",
			"email":     "weak@test.com",
			"password":  "weak", // Too short, no uppercase, no special chars
		}
		body, _ := json.Marshal(payload)

		req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("rejects registration with missing required fields", func(t *testing.T) {
		payload := map[string]string{
			"email": "incomplete@test.com",
			// Missing firstName, lastName, password
		}
		body, _ := json.Marshal(payload)

		req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("rejects registration with short name", func(t *testing.T) {
		payload := map[string]string{
			"firstName": "A", // Too short (min 2)
			"lastName":  "Test",
			"email":     "shortname@test.com",
			"password":  "SecurePass123!",
		}
		body, _ := json.Marshal(payload)

		req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestAuthIntegration_Login(t *testing.T) {
	router, db := setupTestRouter(t)
	defer func() {
		db.Exec("DROP TABLE IF EXISTS users")
	}()

	// Register a user first
	registerPayload := map[string]string{
		"firstName": "Login",
		"lastName":  "Test",
		"email":     "login@test.com",
		"password":  "LoginPass123!",
	}
	body, _ := json.Marshal(registerPayload)
	req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	require.Equal(t, http.StatusCreated, w.Code)

	t.Run("successfully logs in with correct credentials", func(t *testing.T) {
		payload := map[string]string{
			"email":    "login@test.com",
			"password": "LoginPass123!",
		}
		body, _ := json.Marshal(payload)

		req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)
		assert.NotEmpty(t, response["token"])
	})

	t.Run("rejects login with incorrect password", func(t *testing.T) {
		payload := map[string]string{
			"email":    "login@test.com",
			"password": "WrongPassword123!",
		}
		body, _ := json.Marshal(payload)

		req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("rejects login with non-existent email", func(t *testing.T) {
		payload := map[string]string{
			"email":    "nonexistent@test.com",
			"password": "SomePassword123!",
		}
		body, _ := json.Marshal(payload)

		req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		assert.NotEqual(t, http.StatusOK, w.Code)
	})

	t.Run("rejects login with invalid email format", func(t *testing.T) {
		payload := map[string]string{
			"email":    "invalid-email",
			"password": "SomePassword123!",
		}
		body, _ := json.Marshal(payload)

		req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestAuthIntegration_ProtectedRoute(t *testing.T) {
	router, db := setupTestRouter(t)
	defer func() {
		db.Exec("DROP TABLE IF EXISTS users")
	}()

	// Register and login to get token
	registerPayload := map[string]string{
		"firstName": "Protected",
		"lastName":  "Test",
		"email":     "protected@test.com",
		"password":  "ProtectedPass123!",
	}
	body, _ := json.Marshal(registerPayload)
	req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	require.Equal(t, http.StatusCreated, w.Code)

	loginPayload := map[string]string{
		"email":    "protected@test.com",
		"password": "ProtectedPass123!",
	}
	body, _ = json.Marshal(loginPayload)
	req = httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)
	require.Equal(t, http.StatusOK, w.Code)

	var loginResponse map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &loginResponse)
	require.NoError(t, err)
	token := loginResponse["token"]

	t.Run("allows access with valid token", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/profile", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	t.Run("denies access without token", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/profile", nil)
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("denies access with invalid token", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/profile", nil)
		req.Header.Set("Authorization", "Bearer invalid.token.here")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("denies access with malformed authorization header", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/profile", nil)
		req.Header.Set("Authorization", "InvalidFormat")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}

func TestAuthIntegration_RateLimiting(t *testing.T) {
	router, db := setupTestRouter(t)
	defer func() {
		db.Exec("DROP TABLE IF EXISTS users")
	}()

	t.Run("rate limits login attempts", func(t *testing.T) {
		payload := map[string]string{
			"email":    "ratelimit@test.com",
			"password": "Password123!",
		}
		body, _ := json.Marshal(payload)

		successCount := 0
		rateLimitCount := 0

		// Make 10 rapid requests
		for i := 0; i < 10; i++ {
			req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			req.RemoteAddr = "192.168.1.100:12345" // Same IP for all requests
			w := httptest.NewRecorder()

			router.ServeHTTP(w, req)

			if w.Code == http.StatusTooManyRequests {
				rateLimitCount++
			} else {
				successCount++
			}
		}

		// Should have some rate limited requests
		assert.Greater(t, rateLimitCount, 0, "Expected some requests to be rate limited")
		assert.Greater(t, successCount, 0, "Expected some requests to succeed")
	})
}
