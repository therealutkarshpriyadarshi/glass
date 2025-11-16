package middlewares

import (
	"net/http"
	"server/app/models"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CourseOwnershipMiddleware checks if the authenticated user is a teacher or admin of the course
// This middleware should be used for operations that require course ownership (e.g., update, delete, create assignments)
func CourseOwnershipMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		courseIDStr := c.Param("id")
		if courseIDStr == "" {
			courseIDStr = c.Param("courseId")
		}

		courseID, err := strconv.ParseUint(courseIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
			c.Abort()
			return
		}

		var enrollment models.Enrollment
		err = db.Where("user_id = ? AND course_id = ? AND role IN ? AND status = ?",
			userID, courseID,
			[]string{models.RoleTeacher.String(), models.RoleAdmin.String()},
			models.EnrollmentStatusApproved).
			First(&enrollment).Error

		if err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to perform this action on this course"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify authorization"})
			}
			c.Abort()
			return
		}

		// Store the enrollment role in context for later use
		c.Set("courseRole", enrollment.Role)
		c.Next()
	}
}

// AssignmentOwnershipMiddleware checks if the authenticated user owns the assignment
// (i.e., is a teacher/admin of the course the assignment belongs to)
func AssignmentOwnershipMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		assignmentIDStr := c.Param("id")
		if assignmentIDStr == "" {
			assignmentIDStr = c.Param("assignmentId")
		}

		assignmentID, err := strconv.ParseUint(assignmentIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid assignment ID"})
			c.Abort()
			return
		}

		// First, get the assignment to find its course
		var assignment models.Assignment
		err = db.First(&assignment, assignmentID).Error
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "Assignment not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve assignment"})
			}
			c.Abort()
			return
		}

		// Check if user is a teacher/admin of the course
		var enrollment models.Enrollment
		err = db.Where("user_id = ? AND course_id = ? AND role IN ? AND status = ?",
			userID, assignment.CourseID,
			[]string{models.RoleTeacher.String(), models.RoleAdmin.String()},
			models.EnrollmentStatusApproved).
			First(&enrollment).Error

		if err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to perform this action on this assignment"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify authorization"})
			}
			c.Abort()
			return
		}

		c.Set("courseRole", enrollment.Role)
		c.Next()
	}
}

// MaterialOwnershipMiddleware checks if the authenticated user owns the material
// (i.e., is a teacher/admin of the course the material belongs to)
func MaterialOwnershipMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		materialIDStr := c.Param("id")
		materialID, err := strconv.ParseUint(materialIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid material ID"})
			c.Abort()
			return
		}

		// First, get the material to find its course
		var material models.Material
		err = db.First(&material, materialID).Error
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "Material not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve material"})
			}
			c.Abort()
			return
		}

		// Check if user is a teacher/admin of the course
		var enrollment models.Enrollment
		err = db.Where("user_id = ? AND course_id = ? AND role IN ? AND status = ?",
			userID, material.CourseId,
			[]string{models.RoleTeacher.String(), models.RoleAdmin.String()},
			models.EnrollmentStatusApproved).
			First(&enrollment).Error

		if err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to perform this action on this material"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify authorization"})
			}
			c.Abort()
			return
		}

		c.Set("courseRole", enrollment.Role)
		c.Next()
	}
}

// RoleMiddleware checks if the authenticated user has one of the required roles
// This is a generic role-based access control middleware
func RoleMiddleware(db *gorm.DB, allowedRoles []models.Role) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		courseIDStr := c.Param("courseId")
		if courseIDStr == "" {
			courseIDStr = c.Param("id")
		}

		courseID, err := strconv.ParseUint(courseIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
			c.Abort()
			return
		}

		// Convert Role slice to string slice for query
		allowedRoleStrings := make([]string, len(allowedRoles))
		for i, role := range allowedRoles {
			allowedRoleStrings[i] = role.String()
		}

		var enrollment models.Enrollment
		err = db.Where("user_id = ? AND course_id = ? AND role IN ? AND status = ?",
			userID, courseID, allowedRoleStrings, models.EnrollmentStatusApproved).
			First(&enrollment).Error

		if err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to access this resource"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify authorization"})
			}
			c.Abort()
			return
		}

		c.Set("courseRole", enrollment.Role)
		c.Next()
	}
}

// EnrollmentRequiredMiddleware checks if the user is enrolled in the course (any role, approved status)
func EnrollmentRequiredMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		courseIDStr := c.Param("courseId")
		if courseIDStr == "" {
			courseIDStr = c.Param("id")
		}

		courseID, err := strconv.ParseUint(courseIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
			c.Abort()
			return
		}

		var enrollment models.Enrollment
		err = db.Where("user_id = ? AND course_id = ? AND status = ?",
			userID, courseID, models.EnrollmentStatusApproved).
			First(&enrollment).Error

		if err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusForbidden, gin.H{"error": "You are not enrolled in this course"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify enrollment"})
			}
			c.Abort()
			return
		}

		c.Set("courseRole", enrollment.Role)
		c.Set("enrollmentID", enrollment.ID)
		c.Next()
	}
}

// TeacherOnlyMiddleware is a convenience wrapper for RoleMiddleware
func TeacherOnlyMiddleware(db *gorm.DB) gin.HandlerFunc {
	return RoleMiddleware(db, []models.Role{models.RoleTeacher, models.RoleAdmin})
}

// StudentOnlyMiddleware is a convenience wrapper for RoleMiddleware
func StudentOnlyMiddleware(db *gorm.DB) gin.HandlerFunc {
	return RoleMiddleware(db, []models.Role{models.RoleStudent})
}

// GradeOwnershipMiddleware checks if the authenticated user can manage grades
// (i.e., is a teacher/admin of the course the grade's assignment belongs to)
func GradeOwnershipMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		gradeIDStr := c.Param("gradeId")
		if gradeIDStr == "" {
			// For creating grades, we'll need to check the submission's assignment
			// This will be handled in the handler
			c.Next()
			return
		}

		gradeID, err := strconv.ParseUint(gradeIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid grade ID"})
			c.Abort()
			return
		}

		// Get the grade to find its submission and assignment
		var grade models.Grade
		err = db.Preload("Submission").First(&grade, gradeID).Error
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "Grade not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve grade"})
			}
			c.Abort()
			return
		}

		// Get the assignment from the submission
		var assignment models.Assignment
		err = db.First(&assignment, grade.Submission.AssignmentID).Error
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve assignment"})
			c.Abort()
			return
		}

		// Check if user is a teacher/admin of the course
		var enrollment models.Enrollment
		err = db.Where("user_id = ? AND course_id = ? AND role IN ? AND status = ?",
			userID, assignment.CourseID,
			[]string{models.RoleTeacher.String(), models.RoleAdmin.String()},
			models.EnrollmentStatusApproved).
			First(&enrollment).Error

		if err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to manage grades for this assignment"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify authorization"})
			}
			c.Abort()
			return
		}

		c.Set("courseRole", enrollment.Role)
		c.Next()
	}
}
