package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"server/app/middlewares"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestAuthMiddleware(t *testing.T) {
	gin.SetMode(gin.TestMode)
	secretKey := "test_secret_key"

	tests := []struct {
		name           string
		setupAuth      func(*http.Request)
		expectedStatus int
		expectedError  string
	}{
		{
			name: "Valid token",
			setupAuth: func(req *http.Request) {
				token := createValidToken(secretKey)
				req.Header.Set("Authorization", "Bearer "+token)
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Missing Authorization header",
			setupAuth:      func(req *http.Request) {},
			expectedStatus: http.StatusUnauthorized,
			expectedError:  "authorization header is required",
		},
		{
			name: "Invalid token format",
			setupAuth: func(req *http.Request) {
				req.Header.Set("Authorization", "InvalidFormat token")
			},
			expectedStatus: http.StatusUnauthorized,
			expectedError:  "invalid token format",
		},
		{
			name: "Invalid token",
			setupAuth: func(req *http.Request) {
				req.Header.Set("Authorization", "Bearer invalidtoken")
			},
			expectedStatus: http.StatusUnauthorized,
			expectedError:  "invalid token",
		},
		{
			name: "Expired token",
			setupAuth: func(req *http.Request) {
				token := createExpiredToken(secretKey)
				req.Header.Set("Authorization", "Bearer "+token)
			},
			expectedStatus: http.StatusUnauthorized,
			expectedError:  "invalid token",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			router := gin.New()
			router.Use(middlewares.AuthMiddleware(secretKey))
			router.GET("/test", func(c *gin.Context) {
				userID, exists := c.Get("userID")
				if !exists {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "userID not set"})
					return
				}
				c.JSON(http.StatusOK, gin.H{"userID": userID})
			})

			w := httptest.NewRecorder()
			req, _ := http.NewRequest("GET", "/test", nil)
			tt.setupAuth(req)

			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			if tt.expectedError != "" {
				var response map[string]string
				err := json.Unmarshal(w.Body.Bytes(), &response)
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedError, response["error"])
			}

			if tt.expectedStatus == http.StatusOK {
				var response map[string]float64
				err := json.Unmarshal(w.Body.Bytes(), &response)
				assert.NoError(t, err)
				assert.Equal(t, float64(1), response["userID"])
			}
		})
	}
}

func createValidToken(secretKey string) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": float64(1),
		"exp":     time.Now().Add(time.Hour).Unix(),
	})
	tokenString, _ := token.SignedString([]byte(secretKey))
	return tokenString
}

func createExpiredToken(secretKey string) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": float64(1),
		"exp":     time.Now().Add(-time.Hour).Unix(),
	})
	tokenString, _ := token.SignedString([]byte(secretKey))
	return tokenString
}

func TestExtractToken(t *testing.T) {
	tests := []struct {
		name          string
		authHeader    string
		expectedToken string
		expectedError string
	}{
		{
			name:          "Valid Bearer token",
			authHeader:    "Bearer validtoken",
			expectedToken: "validtoken",
		},
		{
			name:          "Missing Authorization header",
			authHeader:    "",
			expectedError: "authorization header is required",
		},
		{
			name:          "Invalid token format",
			authHeader:    "InvalidFormat token",
			expectedError: "invalid token format",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c, _ := gin.CreateTestContext(httptest.NewRecorder())
			c.Request = httptest.NewRequest("GET", "/", nil)
			c.Request.Header.Set("Authorization", tt.authHeader)

			token, err := middlewares.ExportedExtractToken(c)

			if tt.expectedError != "" {
				assert.EqualError(t, err, tt.expectedError)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedToken, token)
			}
		})
	}
}

func TestValidateToken(t *testing.T) {
	secretKey := "test_secret_key"

	tests := []struct {
		name          string
		token         string
		expectedError string
	}{
		{
			name:  "Valid token",
			token: createValidToken(secretKey),
		},
		{
			name:          "Invalid token",
			token:         "invalidtoken",
			expectedError: "invalid token",
		},
		{
			name:          "Expired token",
			token:         createExpiredToken(secretKey),
			expectedError: "invalid token",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			claims, err := middlewares.ExportedValidateToken(tt.token, secretKey)

			if tt.expectedError != "" {
				assert.EqualError(t, err, tt.expectedError)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, claims)
				userID, ok := claims["user_id"].(float64)
				assert.True(t, ok)
				assert.Equal(t, float64(1), userID)
			}
		})
	}
}

func TestExtractUserID(t *testing.T) {
	tests := []struct {
		name          string
		claims        jwt.MapClaims
		expectedID    uint
		expectedError string
	}{
		{
			name:       "Valid user ID",
			claims:     jwt.MapClaims{"user_id": float64(1)},
			expectedID: 1,
		},
		{
			name:          "Missing user ID",
			claims:        jwt.MapClaims{},
			expectedError: "user ID not found in token claims",
		},
		{
			name:          "Invalid user ID type",
			claims:        jwt.MapClaims{"user_id": "invalid"},
			expectedError: "user ID not found in token claims",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			userID, err := middlewares.ExportedExtractUserID(tt.claims)

			if tt.expectedError != "" {
				assert.EqualError(t, err, tt.expectedError)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedID, userID)
			}
		})
	}
}
