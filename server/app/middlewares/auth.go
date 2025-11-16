package middlewares

import (
	"errors"
	"net/http"
	"strings"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware is a middleware that checks for a valid JWT token in the authorization header of an incoming request,
// and sets the user ID from the token to the gin context.
//
// It takes a secret key to validate the token.
//
// If the request does not have a valid token, it returns a 401 Unauthorized status. If the token is not valid, it returns
// a 401 Unauthorized status with a JSON response containing the error message. If the token is valid, it sets the
// user ID to the gin context and calls the next handler in the chain.
//
// Example usage:
//
// router.GET("/api/protected", AuthMiddleware("secretKey"), protectedHandler)
func AuthMiddleware(secretKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := extractToken(c)
		if err != nil {
			handleAuthError(c, http.StatusUnauthorized, err.Error())
			return
		}

		claims, err := validateToken(token, secretKey)
		if err != nil {
			handleAuthError(c, http.StatusUnauthorized, "invalid token")
			return
		}

		userID, err := extractUserID(claims)
		if err != nil {
			handleAuthError(c, http.StatusUnauthorized, "invalid token claims")
			return
		}

		c.Set("userID", userID)
		c.Next()
	}
}

// extractToken extracts the JWT token from the Authorization header of the request.
// It expects the token to be in the format "Bearer <token>".
// Returns the token string if found, or an error if the header is missing or incorrectly formatted.
func extractToken(c *gin.Context) (string, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return "", errors.New("authorization header is required")
	}

	bearerToken := strings.Split(authHeader, " ")
	if len(bearerToken) != 2 || strings.ToLower(bearerToken[0]) != "bearer" {
		return "", errors.New("invalid token format")
	}

	return bearerToken[1], nil
}

// validateToken parses and validates the JWT token using the provided secret key.
// It checks if the token is properly signed and not expired.
// Returns the token claims if valid, or an error if the token is invalid or expired.
func validateToken(tokenStr, secretKey string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secretKey), nil
	})

	if err != nil || !token.Valid {
		return nil, errors.New("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	return claims, nil
}

// extractUserID retrieves the user ID from the JWT claims.
// It expects the user ID to be stored in the "user_id" claim as a float64.
// Returns the user ID as a uint if found, or an error if not present or of incorrect type.
func extractUserID(claims jwt.MapClaims) (uint, error) {
	userID, ok := claims["user_id"].(float64)
	if !ok {
		return 0, errors.New("user ID not found in token claims")
	}
	return uint(userID), nil
}

// handleAuthError sends a JSON response with the given error message and status code,
// then aborts the current request processing.
// This function is used to handle authentication errors in a consistent manner.
func handleAuthError(c *gin.Context, status int, message string) {
	c.JSON(status, gin.H{"error": message})
	c.Abort()
}

// getUserId retrieves the user ID from the gin context.
// It expects the user ID to be stored in the "userID" key as a uint.
// Returns the user ID if found, or an error if not present or of incorrect type.
func getUserId(c *gin.Context) (uint, error) {
	userID, ok := c.Get("userID")
	if !ok {
		return 0, errors.New("user ID not found in context")
	}

	userIDInt, ok := userID.(uint)
	if !ok {
		return 0, errors.New("user ID is not a uint")
	}

	return userIDInt, nil
}

var (
	ExportedExtractToken    = extractToken
	ExportedValidateToken   = validateToken
	ExportedExtractUserID   = extractUserID
	ExportedHandleAuthError = handleAuthError
)
