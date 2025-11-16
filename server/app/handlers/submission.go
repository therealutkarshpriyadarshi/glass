package handlers

import (
	"net/http"
	"server/app/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type SubmissionHandler struct {
	serv *services.SubmissionService
}

func NewSubmissionHandler(serv *services.SubmissionService) *SubmissionHandler {
	return &SubmissionHandler{serv: serv}
}

// CreateSubmission handles the creation of a new submission for an assignment.
// It expects the user ID to be available in the context and the assignment ID as a URL parameter.
// The function processes the uploaded files and creates a new submission using the SubmissionService.
//
// Parameters:
//   - c: The Gin context containing the HTTP request and response information.
//
// Returns:
//   - Responds with a JSON object containing the created submission or an error message.
func (h *SubmissionHandler) CreateSubmission(c *gin.Context) {
	userId := GetUserID(c)
	assignmentId, err := strconv.ParseUint(c.Param("assignmentId"), 10, 32)
	if err != nil {
		HandleBadRequest(c, InvalidAssignmentID)
		return
	}

	form, err := c.MultipartForm()
	if err != nil {
		HandleBadRequest(c, FailedToParseMultipartForm)
		return
	}

	files := form.File["files"]
	if len(files) == 0 {
		HandleBadRequest(c, NoFilesProvided)
		return
	}

	sub, err := h.serv.CreateSubmission(userId, uint(assignmentId), files)
	if err != nil {
		SendError(err, c)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"submission": sub})
}

// CheckCanSeeSubmissionMiddleware returns a Gin middleware function that checks if the current user
// has permission to view a specific submission. It should be used before handlers that retrieve or
// manipulate submission data.
//
// Returns:
//   - A Gin HandlerFunc that performs the permission check.
func (h *SubmissionHandler) CheckCanSeeSubmissionMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userId := GetUserID(c)
		submissionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
		if err != nil {
			HandleBadRequest(c, InvalidSubmissionID)
			c.Abort()
			return
		}

		canSee, err := h.serv.CanSeeSubmission(userId, uint(submissionID))
		if err != nil {
			SendError(err, c)
			c.Abort()
			return
		}

		if !canSee {
			HandleUnauthorized(c, "You are not allowed to see this submission")
			c.Abort()
			return
		}

		c.Next()
	}
}

// GetSubmission retrieves a specific submission by its ID.
// This handler should be called after the CheckCanSeeSubmissionMiddleware to ensure proper authorization.
//
// Parameters:
//   - c: The Gin context containing the HTTP request and response information.
//
// Returns:
//   - Responds with a JSON object containing the requested submission or an error message.
func (h *SubmissionHandler) GetSubmission(c *gin.Context) {
	submissionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		HandleBadRequest(c, InvalidSubmissionID)
		return
	}

	submission, err := h.serv.GetSubmission(uint(submissionID))
	if err != nil {
		HandleNotFound(c, "Submission not found")
		return
	}

	c.JSON(http.StatusOK, submission)
}

// DeleteSubmission handles the deletion of a specific submission by its ID.
//
// Parameters:
//   - c: The Gin context containing the HTTP request and response information.
//
// Returns:
//   - Responds with a JSON object containing a success message or an error message.
func (h *SubmissionHandler) DeleteSubmission(c *gin.Context) {
	submissionID, err := strconv.ParseUint(c.Param(SubmissionIDKey), 10, 32)
	if err != nil {
		HandleBadRequest(c, InvalidSubmissionID)
		return
	}

	if err := h.serv.DeleteSubmission(uint(submissionID)); err != nil {
		SendError(err, c)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Submission deleted successfully"})
}

// GetSubmissionsForAssignment retrieves all submissions for a specific assignment.
// This handler should be called after the CheckCanSeeSubmissionMiddleware to ensure proper authorization.
//
// Parameters:
//   - c: The Gin context containing the HTTP request and response information.
//
// Returns:
//   - Responds with a JSON array containing the submissions for the specified assignment or an error message.
func (h *SubmissionHandler) GetSubmissionsForAssignment(c *gin.Context) {
	assignmentID, err := strconv.ParseUint(c.Param("assignmentId"), 10, 32)
	if err != nil {
		HandleBadRequest(c, InvalidAssignmentID)
		return
	}

	submissions, err := h.serv.GetSubmissionsForAssignment(uint(assignmentID))
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(http.StatusOK, submissions)
}

// UpdateSubmission handles the update of an existing submission with new files.
//
// Parameters:
//   - c: The Gin context containing the HTTP request and response information.
//
// Returns:
//   - Responds with a JSON object containing the updated submission or an error message.
func (h *SubmissionHandler) UpdateSubmission(c *gin.Context) {
	submissionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		HandleBadRequest(c, InvalidSubmissionID)
		return
	}

	form, err := c.MultipartForm()
	if err != nil {
		HandleBadRequest(c, FailedToParseMultipartForm)
		return
	}

	files := form.File["files"]
	if len(files) == 0 {
		HandleBadRequest(c, NoFilesUploaded)
		return
	}

	sub, err := h.serv.UpdateSubmission(uint(submissionID), files)
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(http.StatusOK, sub)
}
