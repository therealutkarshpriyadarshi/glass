package services_test

import (
	"server/app/models"
	"server/app/services"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func setupTestDB(t *testing.T) *gorm.DB {
	// Use in-memory SQLite for testing
	db, err := gorm.Open(postgres.Open("host=localhost user=postgres password=pswrd dbname=glass_test port=5432 sslmode=disable"), &gorm.Config{})
	require.NoError(t, err)

	// Migrate the schema
	err = db.AutoMigrate(&models.User{})
	require.NoError(t, err)

	return db
}

func TestUserService_CreateUser(t *testing.T) {
	db := setupTestDB(t)
	defer func() {
		db.Exec("DROP TABLE IF EXISTS users")
	}()

	secret := []byte("test-secret-key")
	userService := services.NewUserService(db, secret, 24*time.Hour)

	t.Run("successfully creates user with hashed password", func(t *testing.T) {
		user := &models.User{
			FirstName: "John",
			LastName:  "Doe",
			Email:     "john.doe@example.com",
			Password:  "Password123!",
		}

		err := userService.CreateUser(user)
		require.NoError(t, err)
		assert.NotEmpty(t, user.ID)

		// Verify password is hashed
		assert.NotEqual(t, "Password123!", user.Password)
		assert.True(t, len(user.Password) == 60) // bcrypt hash length
	})

	t.Run("prevents duplicate email", func(t *testing.T) {
		user1 := &models.User{
			FirstName: "Jane",
			LastName:  "Doe",
			Email:     "jane@example.com",
			Password:  "Password123!",
		}
		err := userService.CreateUser(user1)
		require.NoError(t, err)

		user2 := &models.User{
			FirstName: "Jane",
			LastName:  "Smith",
			Email:     "jane@example.com",
			Password:  "Password456!",
		}
		err = userService.CreateUser(user2)
		assert.Error(t, err) // Should fail due to duplicate email
	})
}

func TestUserService_AuthenticateUser(t *testing.T) {
	db := setupTestDB(t)
	defer func() {
		db.Exec("DROP TABLE IF EXISTS users")
	}()

	secret := []byte("test-secret-key-for-jwt")
	userService := services.NewUserService(db, secret, 24*time.Hour)

	// Create a test user
	user := &models.User{
		FirstName: "Auth",
		LastName:  "Test",
		Email:     "auth@test.com",
		Password:  "SecurePass123!",
	}
	err := userService.CreateUser(user)
	require.NoError(t, err)

	t.Run("successfully authenticates with correct credentials", func(t *testing.T) {
		token, err := userService.AuthenticateUser("auth@test.com", "SecurePass123!")
		require.NoError(t, err)
		assert.NotEmpty(t, token)

		// Verify token is valid JWT
		parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
			return secret, nil
		})
		require.NoError(t, err)
		assert.True(t, parsedToken.Valid)

		// Verify token contains user_id claim
		claims, ok := parsedToken.Claims.(jwt.MapClaims)
		require.True(t, ok)
		assert.NotNil(t, claims["user_id"])
		assert.NotNil(t, claims["exp"])
		assert.NotNil(t, claims["iat"])
	})

	t.Run("fails authentication with wrong password", func(t *testing.T) {
		token, err := userService.AuthenticateUser("auth@test.com", "WrongPassword123!")
		assert.Error(t, err)
		assert.Empty(t, token)
	})

	t.Run("fails authentication with non-existent email", func(t *testing.T) {
		token, err := userService.AuthenticateUser("nonexistent@test.com", "SecurePass123!")
		assert.Error(t, err)
		assert.Empty(t, token)
	})
}

func TestUserService_VerifyToken(t *testing.T) {
	db := setupTestDB(t)
	defer func() {
		db.Exec("DROP TABLE IF EXISTS users")
	}()

	secret := []byte("test-secret-key-verify")
	userService := services.NewUserService(db, secret, 24*time.Hour)

	// Create a test user
	user := &models.User{
		FirstName: "Token",
		LastName:  "Test",
		Email:     "token@test.com",
		Password:  "SecurePass123!",
	}
	err := userService.CreateUser(user)
	require.NoError(t, err)

	t.Run("successfully verifies valid token", func(t *testing.T) {
		token, err := userService.AuthenticateUser("token@test.com", "SecurePass123!")
		require.NoError(t, err)

		parsedToken, err := userService.VerifyToken(token)
		require.NoError(t, err)
		assert.True(t, parsedToken.Valid)
	})

	t.Run("fails to verify invalid token", func(t *testing.T) {
		_, err := userService.VerifyToken("invalid.token.here")
		assert.Error(t, err)
	})

	t.Run("fails to verify token with wrong secret", func(t *testing.T) {
		// Create token with different secret
		wrongSecret := []byte("wrong-secret")
		wrongService := services.NewUserService(db, wrongSecret, 24*time.Hour)
		token, err := wrongService.AuthenticateUser("token@test.com", "SecurePass123!")
		require.NoError(t, err)

		// Try to verify with correct service
		_, err = userService.VerifyToken(token)
		assert.Error(t, err)
	})
}

func TestUserService_ChangePassword(t *testing.T) {
	db := setupTestDB(t)
	defer func() {
		db.Exec("DROP TABLE IF EXISTS users")
	}()

	secret := []byte("test-secret-key-password")
	userService := services.NewUserService(db, secret, 24*time.Hour)

	// Create a test user
	user := &models.User{
		FirstName: "Password",
		LastName:  "Change",
		Email:     "password@test.com",
		Password:  "OldPassword123!",
	}
	err := userService.CreateUser(user)
	require.NoError(t, err)

	t.Run("successfully changes password", func(t *testing.T) {
		err := userService.ChangePassword(user.ID, "OldPassword123!", "NewPassword456!")
		require.NoError(t, err)

		// Verify can login with new password
		token, err := userService.AuthenticateUser("password@test.com", "NewPassword456!")
		require.NoError(t, err)
		assert.NotEmpty(t, token)

		// Verify cannot login with old password
		_, err = userService.AuthenticateUser("password@test.com", "OldPassword123!")
		assert.Error(t, err)
	})

	t.Run("fails to change password with wrong old password", func(t *testing.T) {
		err := userService.ChangePassword(user.ID, "WrongOldPassword!", "AnotherPassword789!")
		assert.Error(t, err)
	})
}
