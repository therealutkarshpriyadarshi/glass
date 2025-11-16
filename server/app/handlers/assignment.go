package handlers

import (
	"net/http"
	"server/app/models"
	"server/app/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

// AssignmentHandler handles HTTP requests related to assignment operations.
type AssignmentHandler struct {
	serv *services.AssignmentService
}

// NewAssignmentHandler creates a new AssignmentHandler with the given AssignmentService.
func NewAssignmentHandler(assignmentService *services.AssignmentService) *AssignmentHandler {
	return &AssignmentHandler{
		serv: assignmentService,
	}
}

// Create handles the creation of a new assignment.
// It expects a JSON payload representing the assignment details.
//
// Method: POST
// Route: /assignments
//
// Parameters:
//   - c: The Gin context for the current request.
//
// Returns:
//   - 201 Created: Returns the created assignment as JSON.
//   - 400 Bad Request: If the JSON payload is invalid.
//   - 500 Internal Server Error: If there's an error creating the assignment.
func (h *AssignmentHandler) Create(c *gin.Context) {
	var assignment models.Assignment
	if err := c.ShouldBindJSON(&assignment); err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	if err := h.serv.Create(&assignment); err != nil {
		HandleError(c, http.StatusInternalServerError, "Failed to create assignment")
		return
	}

	c.JSON(http.StatusCreated, assignment)
}

// Get retrieves an assignment by its ID.
// It expects the assignment ID as a URL parameter.
//
// Method: GET
// Route: /assignments/:id
//
// Parameters:
//   - c: The Gin context for the current request.
//   - id: The ID of the assignment to retrieve (from URL).
//
// Returns:
//   - 200 OK: Returns the assignment as JSON.
//   - 400 Bad Request: If the assignment ID is invalid.
//   - 404 Not Found: If the assignment doesn't exist.
//   - 500 Internal Server Error: If there's an error retrieving the assignment.
func (h *AssignmentHandler) Get(c *gin.Context) {
	id, err := GetParamUint(c, "id")
	if err != nil {
		HandleBadRequest(c, "Invalid assignment ID")
		return
	}

	assignment, err := h.serv.Get(id)
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(http.StatusOK, assignment)
}

// UpdateAssignment handles the updating of an existing assignment.
// It expects the assignment ID as a URL parameter and a JSON payload with updated details.
//
// Method: PUT
// Route: /assignments/:id
//
// Parameters:
//   - c: The Gin context for the current request.
//   - id: The ID of the assignment to update (from URL).
//
// Returns:
//   - 200 OK: Returns the updated assignment as JSON.
//   - 400 Bad Request: If the assignment ID is invalid or the JSON payload is invalid.
//   - 404 Not Found: If the assignment doesn't exist.
//   - 500 Internal Server Error: If there's an error updating the assignment.
func (h *AssignmentHandler) UpdateAssignment(c *gin.Context) {
	id, err := GetParamUint(c, "id")
	if err != nil {
		HandleBadRequest(c, "Invalid assignment ID")
		return
	}

	var assignment models.Assignment
	if err := c.ShouldBindJSON(&assignment); err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	assignment.ID = id
	if err := h.serv.Update(&assignment); err != nil {
		SendError(err, c)
		return
	}

	c.JSON(http.StatusOK, assignment)
}

// Delete handles the deletion of an assignment.
// It expects the assignment ID as a URL parameter.
//
// Method: DELETE
// Route: /assignments/:id
//
// Parameters:
//   - c: The Gin context for the current request.
//   - id: The ID of the assignment to delete (from URL).
//
// Returns:
//   - 200 OK: If the assignment was successfully deleted.
//   - 400 Bad Request: If the assignment ID is invalid.
//   - 404 Not Found: If the assignment doesn't exist.
//   - 500 Internal Server Error: If there's an error deleting the assignment.
func (h *AssignmentHandler) Delete(c *gin.Context) {
	id, err := GetParamUint(c, "id")
	if err != nil {
		HandleBadRequest(c, "Invalid assignment ID")
		return
	}

	if err := h.serv.Delete(id); err != nil {
		SendError(err, c)
		return
	}

	HandleOk(c, "Assignment deleted successfully")
}

// GetAssignmentsForCourse retrieves all assignments for a specific course.
// It expects the course ID as a URL parameter.
//
// Method: GET
// Route: /courses/:courseId/assignments
//
// Parameters:
//   - c: The Gin context for the current request.
//   - courseId: The ID of the course to get assignments for (from URL).
//
// Returns:
//   - 200 OK: Returns a list of assignments as JSON.
//   - 400 Bad Request: If the course ID is invalid.
//   - 500 Internal Server Error: If there's an error retrieving the assignments.
func (h *AssignmentHandler) GetAssignmentsForCourse(c *gin.Context) {
	courseID, err := GetParamUint(c, "courseId")
	if err != nil {
		HandleBadRequest(c, "Invalid course ID")
		return
	}

	assignments, err := h.serv.GetAssignmentsForCourse(courseID)
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(http.StatusOK, assignments)
}

// PublishAssignment handles the publishing of an assignment.
// It expects the assignment ID as a URL parameter.
//
// Method: POST
// Route: /assignments/:id/publish
//
// Parameters:
//   - c: The Gin context for the current request.
//   - id: The ID of the assignment to publish (from URL).
//
// Returns:
//   - 200 OK: If the assignment was successfully published.
//   - 400 Bad Request: If the assignment ID is invalid.
//   - 404 Not Found: If the assignment doesn't exist.
//   - 500 Internal Server Error: If there's an error publishing the assignment.
func (h *AssignmentHandler) PublishAssignment(c *gin.Context) {
	id, err := GetParamUint(c, "id")
	if err != nil {
		HandleBadRequest(c, "Invalid assignment ID")
		return
	}

	if err := h.serv.Publish(id); err != nil {
		SendError(err, c)
		return
	}

	HandleOk(c, "Assignment published successfully")
}

// UnpublishAssignment handles the unpublishing of an assignment.
// It expects the assignment ID as a URL parameter.
//
// Method: POST
// Route: /assignments/:id/unpublish
//
// Parameters:
//   - c: The Gin context for the current request.
//   - id: The ID of the assignment to unpublish (from URL).
//
// Returns:
//   - 200 OK: If the assignment was successfully unpublished.
//   - 400 Bad Request: If the assignment ID is invalid.
//   - 404 Not Found: If the assignment doesn't exist.
//   - 500 Internal Server Error: If there's an error unpublishing the assignment.
func (h *AssignmentHandler) UnpublishAssignment(c *gin.Context) {
	id, err := GetParamUint(c, "id")
	if err != nil {
		HandleBadRequest(c, "Invalid assignment ID")
		return
	}

	if err := h.serv.Unpublish(id); err != nil {
		SendError(err, c)
		return
	}

	HandleOk(c, "Assignment unpublished successfully")
}

// GetUpcomingAssignments retrieves upcoming assignments for a user.
// It expects the user ID from the context and an optional limit query parameter.
//
// Method: GET
// Route: /assignments/upcoming
//
// Parameters:
//   - c: The Gin context for the current request.
//   - limit: Optional query parameter to limit the number of assignments returned (default: 5).
//
// Returns:
//   - 200 OK: Returns a list of upcoming assignments as JSON.
//   - 500 Internal Server Error: If there's an error retrieving the assignments.
func (h *AssignmentHandler) GetUpcomingAssignments(c *gin.Context) {
	userID := GetUserID(c)
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "5"))

	assignments, err := h.serv.GetUpcomingAssignments(userID, limit)
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(http.StatusOK, assignments)
}

// GetOverdueAssignments retrieves overdue assignments for a user.
// It expects the user ID from the context.
//
// Method: GET
// Route: /assignments/overdue
//
// Parameters:
//   - c: The Gin context for the current request.
//
// Returns:
//   - 200 OK: Returns a list of overdue assignments as JSON.
//   - 500 Internal Server Error: If there's an error retrieving the assignments.
func (h *AssignmentHandler) GetOverdueAssignments(c *gin.Context) {
	userID := GetUserID(c)

	assignments, err := h.serv.GetOverdueAssignments(userID)
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(http.StatusOK, assignments)
}

// GetAssignmentCompletion retrieves the completion status of an assignment.
// It expects the assignment ID as a URL parameter.
//
// Method: GET
// Route: /assignments/:id/completion
//
// Parameters:
//   - c: The Gin context for the current request.
//   - id: The ID of the assignment to get completion status for (from URL).
//
// Returns:
//   - 200 OK: Returns the completion status as JSON.
//   - 400 Bad Request: If the assignment ID is invalid.
//   - 404 Not Found: If the assignment doesn't exist.
//   - 500 Internal Server Error: If there's an error retrieving the completion status.
func (h *AssignmentHandler) GetAssignmentCompletion(c *gin.Context) {
	id, err := GetParamUint(c, "id")
	if err != nil {
		HandleBadRequest(c, "Invalid assignment ID")
		return
	}

	completion, err := h.serv.GetAssignmentCompletion(id)
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(http.StatusOK, gin.H{"completion": completion})
}
