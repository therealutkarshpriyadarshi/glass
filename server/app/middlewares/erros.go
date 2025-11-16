package middlewares

import (
	"net/http"
	"server/app/handlers"

	"github.com/gin-gonic/gin"
)

// ErrorHandler is a middleware that recovers from any panics and handles errors
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				HandleInternalServerError(c, "Internal Server Error")
			}
		}()
		c.Next()
	}
}

// HandleBadRequestWithAbort handles bad request errors and aborts the request
func HandleBadRequestWithAbort(c *gin.Context, message string) {
	handlers.HandleBadRequest(c, message)
	c.Abort()
}

// HandleUnauthorizedWithAbort handles unauthorized errors and aborts the request
func HandleUnauthorizedWithAbort(c *gin.Context, message string) {
	handlers.HandleUnauthorized(c, message)
	c.Abort()
}

// HandleForbiddenWithAbort handles forbidden errors and aborts the request
func HandleForbiddenWithAbort(c *gin.Context, message string) {
	handlers.HandleForbidden(c, message)
	c.Abort()
}

// HandleNotFoundWithAbort handles not found errors and aborts the request
func HandleNotFoundWithAbort(c *gin.Context, message string) {
	handlers.HandleNotFound(c, message)
	c.Abort()
}

// HandleInternalServerError handles internal server errors and aborts the request
func HandleInternalServerError(c *gin.Context, message string) {
	handlers.HandleError(c, http.StatusInternalServerError, message)
	c.Abort()
}
