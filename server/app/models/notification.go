package models

import (
	"time"

	"gorm.io/gorm"
)

// NotificationType represents the type of notification
type NotificationType string

const (
	NotificationAssignmentPublished NotificationType = "assignment_published"
	NotificationSubmissionGraded    NotificationType = "submission_graded"
	NotificationEnrollmentApproved  NotificationType = "enrollment_approved"
	NotificationEnrollmentRejected  NotificationType = "enrollment_rejected"
	NotificationQuizAvailable       NotificationType = "quiz_available"
	NotificationQuizGraded          NotificationType = "quiz_graded"
	NotificationCourseUpdated       NotificationType = "course_updated"
)

// Notification represents a user notification
type Notification struct {
	gorm.Model
	UserID    uint             `json:"userId" gorm:"not null;index"`
	User      User             `json:"user" gorm:"foreignKey:UserID"`
	Title     string           `json:"title" gorm:"not null" binding:"required,max=200"`
	Content   string           `json:"content" gorm:"not null" binding:"required,max=1000"`
	Type      NotificationType `json:"type" gorm:"not null;index" binding:"required"`
	IsRead    bool             `json:"isRead" gorm:"default:false;index"`
	ReadAt    *time.Time       `json:"readAt"`
	RelatedID *uint            `json:"relatedId"` // ID of related entity (assignment, course, etc.)
}

// MarkAsRead marks the notification as read
func (n *Notification) MarkAsRead() {
	n.IsRead = true
	now := time.Now()
	n.ReadAt = &now
}
