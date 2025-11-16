package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"server/app/models"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()
	return r
}

func TestGetCourses(t *testing.T) {
	router := SetupRouter()

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/courses", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	// Add more assertions here to check the response body
}

func TestCreateCourse(t *testing.T) {
	router := SetupRouter()

	course := models.Course{
		Name:        "Test Course",
		Description: "This is a test course",
		StartDate:   "2023-01-01",
		EndDate:     "2023-12-31",
		MaxStudents: 30,
		Difficulty:  "Intermediate",
		Category:    "Programming",
		IsActive:    true,
	}

	jsonValue, _ := json.Marshal(course)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/courses", bytes.NewBuffer(jsonValue))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	assert.Equal(t, 201, w.Code)
	// Add more assertions here to check the response body
}

func TestGetCourse(t *testing.T) {
	router := SetupRouter()

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/courses/1", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	// Add more assertions here to check the response body
}

func TestUpdateCourse(t *testing.T) {
	router := SetupRouter()

	updatedCourse := models.Course{
		Name: "Updated Test Course",
	}

	jsonValue, _ := json.Marshal(updatedCourse)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PUT", "/api/courses/1", bytes.NewBuffer(jsonValue))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	// Add more assertions here to check the response body
}

func TestDeleteCourse(t *testing.T) {
	router := SetupRouter()

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("DELETE", "/api/courses/1", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	// Add more assertions here to check the response body
}
