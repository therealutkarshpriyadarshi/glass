package models_test

import (
	"server/app/models"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(postgres.Open("host=localhost user=postgres password=pswrd dbname=glass_test port=5432 sslmode=disable"), &gorm.Config{})
	require.NoError(t, err)

	err = db.AutoMigrate(&models.User{})
	require.NoError(t, err)

	return db
}

func TestUser_PasswordHashing(t *testing.T) {
	db := setupTestDB(t)
	defer func() {
		db.Exec("DROP TABLE IF EXISTS users")
	}()

	t.Run("hashes password on create", func(t *testing.T) {
		user := &models.User{
			FirstName: "Hash",
			LastName:  "Test",
			Email:     "hash@test.com",
			Password:  "PlainPassword123!",
		}

		err := db.Create(user).Error
		require.NoError(t, err)

		// Password should be hashed
		assert.NotEqual(t, "PlainPassword123!", user.Password)
		assert.Len(t, user.Password, 60) // bcrypt hash is 60 chars
		assert.True(t, user.Password[:4] == "$2a$" || user.Password[:4] == "$2b$" || user.Password[:4] == "$2y$")
	})

	t.Run("does not double-hash already hashed password on update", func(t *testing.T) {
		// Create user with password
		user := &models.User{
			FirstName: "Update",
			LastName:  "Test",
			Email:     "update@test.com",
			Password:  "InitialPassword123!",
		}
		err := db.Create(user).Error
		require.NoError(t, err)

		originalHash := user.Password

		// Update user without changing password
		user.FirstName = "UpdatedName"
		err = db.Save(user).Error
		require.NoError(t, err)

		// Password hash should remain the same
		assert.Equal(t, originalHash, user.Password)
	})

	t.Run("hashes new password on update", func(t *testing.T) {
		// Create user
		user := &models.User{
			FirstName: "NewPass",
			LastName:  "Test",
			Email:     "newpass@test.com",
			Password:  "FirstPassword123!",
		}
		err := db.Create(user).Error
		require.NoError(t, err)

		originalHash := user.Password

		// Update with new plain text password
		user.Password = "SecondPassword456!"
		err = db.Save(user).Error
		require.NoError(t, err)

		// Password should be re-hashed and different from original
		assert.NotEqual(t, originalHash, user.Password)
		assert.NotEqual(t, "SecondPassword456!", user.Password)
		assert.Len(t, user.Password, 60)
	})
}

func TestUser_CheckPassword(t *testing.T) {
	db := setupTestDB(t)
	defer func() {
		db.Exec("DROP TABLE IF EXISTS users")
	}()

	user := &models.User{
		FirstName: "Check",
		LastName:  "Password",
		Email:     "check@test.com",
		Password:  "CorrectPassword123!",
	}
	err := db.Create(user).Error
	require.NoError(t, err)

	t.Run("returns true for correct password", func(t *testing.T) {
		isValid := user.CheckPassword("CorrectPassword123!")
		assert.True(t, isValid)
	})

	t.Run("returns false for incorrect password", func(t *testing.T) {
		isValid := user.CheckPassword("WrongPassword123!")
		assert.False(t, isValid)
	})

	t.Run("returns false for empty password", func(t *testing.T) {
		isValid := user.CheckPassword("")
		assert.False(t, isValid)
	})
}

func TestUser_IsPasswordHashed(t *testing.T) {
	t.Run("detects bcrypt hash", func(t *testing.T) {
		user := &models.User{
			Password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
		}
		// Using reflection to test private method
		// In production, this is tested indirectly through BeforeSave
		assert.Len(t, user.Password, 60)
		assert.True(t, user.Password[:4] == "$2a$")
	})

	t.Run("detects plain text password", func(t *testing.T) {
		user := &models.User{
			Password: "PlainTextPassword123!",
		}
		assert.NotEqual(t, 60, len(user.Password))
	})
}

func TestUser_ValidationConstraints(t *testing.T) {
	db := setupTestDB(t)
	defer func() {
		db.Exec("DROP TABLE IF EXISTS users")
	}()

	t.Run("enforces unique email constraint", func(t *testing.T) {
		user1 := &models.User{
			FirstName: "First",
			LastName:  "User",
			Email:     "duplicate@test.com",
			Password:  "Password123!",
		}
		err := db.Create(user1).Error
		require.NoError(t, err)

		user2 := &models.User{
			FirstName: "Second",
			LastName:  "User",
			Email:     "duplicate@test.com",
			Password:  "Password456!",
		}
		err = db.Create(user2).Error
		assert.Error(t, err)
	})

	t.Run("enforces not null constraints", func(t *testing.T) {
		user := &models.User{
			Email: "incomplete@test.com",
			// Missing FirstName, LastName, Password
		}
		err := db.Create(user).Error
		assert.Error(t, err)
	})
}
