package handlers

import (
	"net/http"
	"server/app/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GradeHandler handles HTTP requests related to grading operations.
type GradeHandler struct {
	serv *services.GradeService
}

func NewGradeHandler(serv *services.GradeService) *GradeHandler {
	return &GradeHandler{serv: serv}
}

// Create handles the creation of a new grade for a submission.
// It expects a JSON payload with submissionId, pointsEarned, and optional feedback.
// The grade is created by the authenticated user (gradedBy).
func (h *GradeHandler) Create(c *gin.Context) {
	var input struct {
		SubmissionID uint    `json:"submissionId" binding:"required"`
		PointsEarned float64 `json:"pointsEarned" binding:"required"`
		Feedback     string  `json:"feedback"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	gradedBy := c.GetUint("userID")

	grade, err := h.serv.Create(input.SubmissionID, gradedBy, input.PointsEarned, input.Feedback)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create grade"})
		return
	}

	c.JSON(http.StatusCreated, grade)
}

// GetGrade retrieves a specific grade by its ID.
// It returns the grade details if found, or an error if not found or if the ID is invalid.
func (h *GradeHandler) GetGrade(c *gin.Context) {
	gradeID, err := strconv.ParseUint(c.Param("gradeId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid grade ID"})
		return
	}

	grade, err := h.serv.Get(uint(gradeID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Grade not found"})
		return
	}

	c.JSON(http.StatusOK, grade)
}

// UpdateGrade handles the updating of an existing grade.
// It expects a JSON payload with pointsEarned and optional feedback.
// The grade is identified by the gradeId parameter in the URL.
func (h *GradeHandler) UpdateGrade(c *gin.Context) {
	gradeID, err := strconv.ParseUint(c.Param("gradeId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid grade ID"})
		return
	}

	var input struct {
		PointsEarned float64 `json:"pointsEarned" binding:"required"`
		Feedback     string  `json:"feedback"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	grade, err := h.serv.Update(uint(gradeID), input.PointsEarned, input.Feedback)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update grade"})
		return
	}

	c.JSON(http.StatusOK, grade)
}

// GradesForUser retrieves all grades for a specific user.
// It expects a user ID as a URL parameter and returns a list of grades associated with that user.
// If the user ID is invalid or if there's an error retrieving the grades, it returns an appropriate error response.
func (h *GradeHandler) GradesForUser(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("userId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	grades, err := h.serv.GradesForUser(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve grades"})
		return
	}

	c.JSON(http.StatusOK, grades)
}

// GradeStats retrieves statistical information about grades for a specific assignment.
// It expects an assignment ID as a URL parameter and returns grade statistics such as average, maximum, and minimum points.
// If the assignment ID is invalid or if there's an error retrieving the statistics, it returns an appropriate error response.
func (h *GradeHandler) GradeStats(c *gin.Context) {
	assignmentID, err := strconv.ParseUint(c.Param("assignmentId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid assignment ID"})
		return
	}

	stats, err := h.serv.GradeStatistics(uint(assignmentID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve grade statistics"})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GetGradesForAssignment retrieves all grades for a specific assignment.
// It expects an assignment ID as a URL parameter and returns a list of grades associated with that assignment.
// If the assignment ID is invalid or if there's an error retrieving the grades, it returns an appropriate error response.
func (h *GradeHandler) GetGradesForAssignment(c *gin.Context) {
	assignmentID, err := strconv.ParseUint(c.Param("assignmentId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid assignment ID"})
		return
	}

	grades, err := h.serv.GradesForAssignment(uint(assignmentID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve grades"})
		return
	}

	c.JSON(http.StatusOK, grades)
}
