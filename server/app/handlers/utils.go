package handlers

import (
	"errors"
	"mime/multipart"
	"net/http"
	"server/app/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetUserID(c *gin.Context) uint {
	return c.GetUint("userId")
}

// HandleOk sends a JSON response with a 200 OK status and the given message.
//
// Parameters:
//   - c: The Gin context for the current request.
//   - message: The message to be included in the response.
func HandleOk(c *gin.Context, message string) {
	c.JSON(http.StatusOK, gin.H{"message": message})
}

// HandleCreated sends a JSON response with a 201 Created status and the given message.
//
// Parameters:
//   - c: The Gin context for the current request.
//   - message: The message to be included in the response.
func HandleCreated(c *gin.Context, message string) {
	c.JSON(http.StatusCreated, gin.H{"message": message})
}

// HandleDeleted sends a JSON response with a 204 No Content status and the given message.
//
// Parameters:
//   - c: The Gin context for the current request.
//   - message: The message to be included in the response.
func HandleDeleted(c *gin.Context, message string) {
	c.JSON(http.StatusNoContent, gin.H{"message": message})
}

// HandleError sends a JSON response with the given status code and error message.
//
// Parameters:
//   - c: The Gin context for the current request.
//   - status: The HTTP status code to be sent in the response.
//   - message: The error message to be included in the response.
func HandleError(c *gin.Context, status int, message string) {
	c.JSON(status, gin.H{"error": message})
}

// HandleBadRequest sends a JSON response with a 400 Bad Request status and the given error message.
//
// Parameters:
//   - c: The Gin context for the current request.
//   - message: The error message to be included in the response.
func HandleBadRequest(c *gin.Context, message string) {
	HandleError(c, http.StatusBadRequest, message)
}

// HandleNotFound sends a JSON response with a 404 Not Found status and the given error message.
//
// Parameters:
//   - c: The Gin context for the current request.
//   - message: The error message to be included in the response.
func HandleNotFound(c *gin.Context, message string) {
	HandleError(c, http.StatusNotFound, message)
}

// HandleUnauthorized sends a JSON response with a 401 Unauthorized status and the given error message.
//
// Parameters:
//   - c: The Gin context for the current request.
//   - message: The error message to be included in the response.
func HandleUnauthorized(c *gin.Context, message string) {
	HandleError(c, http.StatusUnauthorized, message)
}

// HandleForbidden sends a JSON response with a 403 Forbidden status and the given error message.
//
// Parameters:
//   - c: The Gin context for the current request.
//   - message: The error message to be included in the response.
func HandleForbidden(c *gin.Context, message string) {
	HandleError(c, http.StatusForbidden, message)
}

// SendError handles different types of errors and sends appropriate HTTP responses.
//
// This function checks the type of the error and calls the corresponding error
// handling function with the appropriate status code and message.
//
// Parameters:
//   - err: The error to be handled.
//   - c: The Gin context for the current request.
func SendError(err error, c *gin.Context) {
	var entityNotFoundError services.EntityNotFoundError
	var createEntityFailureError services.CreateEntityFailureError
	var permissionDeniedError services.PermissionDeniedError
	var cannotPerformActionError services.CannotPerformActionError

	switch {
	case errors.As(err, &entityNotFoundError):
		HandleNotFound(c, err.Error())
		return

	case errors.As(err, &permissionDeniedError) || errors.As(err, &cannotPerformActionError):
		HandleUnauthorized(c, err.Error())
		return

	case errors.As(err, &createEntityFailureError):
		HandleError(c, http.StatusInternalServerError, err.Error())

	default:
		HandleError(c, http.StatusInternalServerError, "an error occurred")
	}
}

// ParseFiles parses the files from the multipart form.
//
// Parameters:
//   - c: The Gin context for the current request.
//
// Returns:
//   - []*multipart.FileHeader: A slice of FileHeader pointers representing the files.
//   - error: An error if the parsing fails, nil otherwise.
func ParseFiles(c *gin.Context) ([]*multipart.FileHeader, error) {
	form, err := c.MultipartForm()
	if err != nil {
		return nil, err
	}

	return form.File["files"], nil
}

// GetParamUint parses the parameter with the given key as a uint.
//
// Parameters:
//   - c: The Gin context for the current request.
//   - key: The key of the parameter to be parsed.
//
// Returns:
//   - uint: The parsed uint value.
func GetParamUint(c *gin.Context, key string) (uint, error) {
	param, err := strconv.ParseUint(c.Param(key), 10, 32)
	if err != nil {
		return 0, err
	}

	return uint(param), nil
}
