package handlers

import (
	"net/http"
	"server/app/models"
	"server/app/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type EnrollmentHandler struct {
	serv *services.EnrollmentService
}

func NewEnrollmentHandler(serv *services.EnrollmentService) *EnrollmentHandler {
	return &EnrollmentHandler{serv: serv}
}

// EnrollToCourse handles the approval of a pending enrollment request.
// It expects the enrollment ID as a URL parameter.
//
// Method: POST
// Route: /enrollments/:id/approve
//
// Parameters:
//   - id: The ID of the enrollment to be approved (from URL)
//
// Returns:
//   - 200 OK: If the enrollment is successfully approved
//   - 400 Bad Request: If the enrollment ID is invalid
//   - 500 Internal Server Error: If there's an error during the approval process
func (h *EnrollmentHandler) EnrollToCourse(c *gin.Context) {
	adminId := GetUserID(c)
	enrollId, err := strconv.ParseUint(c.Param("id"), 10, 32)

	if err != nil {
		HandleBadRequest(c, InvalidEnrollmentID)
		return
	}

	if err := h.serv.ApproveEnrolment(adminId, uint(enrollId)); err != nil {
		SendError(err, c)
		return
	}

	HandleOk(c, "Enrollment approved")
}

// RejectEnrollment handles the rejection of a pending enrollment request.
// It expects the enrollment ID as a URL parameter.
//
// Method: POST
// Route: /enrollments/:id/reject
//
// Parameters:
//   - id: The ID of the enrollment to be rejected (from URL)
//
// Returns:
//   - 200 OK: If the enrollment is successfully rejected
//   - 400 Bad Request: If the enrollment ID is invalid
//   - 500 Internal Server Error: If there's an error during the rejection process
func (h *EnrollmentHandler) RejectEnrollment(c *gin.Context) {
	adminId := GetUserID(c)
	enrollID, err := strconv.ParseUint(c.Param("id"), 10, 32)

	if err != nil {
		HandleBadRequest(c, InvalidEnrollmentID)
		return
	}

	if err := h.serv.RejectEnrolment(adminId, uint(enrollID)); err != nil {
		SendError(err, c)
		return
	}

	HandleOk(c, "Enrollment rejected")
}

// JoinCourseByCode handles the request to join a course using an invitation code.
// It expects the invitation code and role in the request body.
//
// Method: POST
// Route: /courses/join
//
// Request Body:
//   - code: The invitation code for the course (string, required)
//   - role: The role of the user in the course (string, required)
//
// Returns:
//   - 200 OK: If the user successfully joins the course
//   - 400 Bad Request: If the request body is invalid or the role is invalid
//   - 500 Internal Server Error: If there's an error during the join process
func (h *EnrollmentHandler) JoinCourseByCode(c *gin.Context) {
	userId := GetUserID(c)
	var input struct {
		InvitationCode string `json:"code" binding:"required"`
		Role           string `json:"role" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	if !h.serv.IsValidRole(input.Role) {
		HandleBadRequest(c, "Invalid role")
		return
	}

	code := input.InvitationCode
	role := input.Role
	if err := h.serv.JoinCourseByCode(userId, code, models.Role(role)); err != nil {
		SendError(err, c)
		return
	}

	HandleOk(c, "Successfully joined course")
}

// GetPendingEnrollments retrieves all pending enrollments for a specific course.
// It expects the course ID as a URL parameter.
//
// Method: GET
// Route: /courses/:id/pending-enrollments
//
// Parameters:
//   - id: The ID of the course to get pending enrollments for (from URL)
//
// Returns:
//   - 200 OK: Returns a list of pending enrollments
//   - 400 Bad Request: If the course ID is invalid
//   - 403 Forbidden: If the user is not the admin of the course
//   - 500 Internal Server Error: If there's an error retrieving the enrollments
func (h *EnrollmentHandler) GetPendingEnrollments(c *gin.Context) {
	adminId := GetUserID(c)
	courseId, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	ok, err := h.serv.IsAdmin(adminId, uint(courseId))
	if err != nil {
		SendError(err, c)
		return
	}

	if !ok {
		HandleForbidden(c, "Only course creator can get pending enrollments")
		return
	}
	enrollments, err := h.serv.GetPendingEnrollments(uint(courseId))
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(http.StatusOK, gin.H{"enrollments": enrollments})
}
