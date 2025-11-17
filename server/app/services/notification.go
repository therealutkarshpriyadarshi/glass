package services

import (
	"server/app/models"

	"gorm.io/gorm"
)

// NotificationService handles notification-related operations
type NotificationService struct {
	db *gorm.DB
}

// NewNotificationService creates a new NotificationService instance
func NewNotificationService(db *gorm.DB) *NotificationService {
	return &NotificationService{db: db}
}

// CreateNotification creates a new notification
func (s *NotificationService) CreateNotification(notification *models.Notification) error {
	return s.db.Create(notification).Error
}

// GetNotificationByID retrieves a notification by ID
func (s *NotificationService) GetNotificationByID(id uint) (*models.Notification, error) {
	var notification models.Notification
	if err := s.db.Preload("User").First(&notification, id).Error; err != nil {
		return nil, err
	}
	return &notification, nil
}

// GetUserNotifications retrieves all notifications for a user, ordered by most recent first
func (s *NotificationService) GetUserNotifications(userID uint, limit int, offset int) ([]models.Notification, int64, error) {
	var notifications []models.Notification
	var total int64

	// Count total notifications
	if err := s.db.Model(&models.Notification{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated notifications
	query := s.db.Where("user_id = ?", userID).
		Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit).Offset(offset)
	}

	if err := query.Find(&notifications).Error; err != nil {
		return nil, 0, err
	}

	return notifications, total, nil
}

// GetUnreadNotifications retrieves all unread notifications for a user
func (s *NotificationService) GetUnreadNotifications(userID uint) ([]models.Notification, error) {
	var notifications []models.Notification
	if err := s.db.Where("user_id = ? AND is_read = ?", userID, false).
		Order("created_at DESC").
		Find(&notifications).Error; err != nil {
		return nil, err
	}
	return notifications, nil
}

// GetUnreadCount returns the count of unread notifications for a user
func (s *NotificationService) GetUnreadCount(userID uint) (int64, error) {
	var count int64
	if err := s.db.Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

// MarkAsRead marks a notification as read
func (s *NotificationService) MarkAsRead(notificationID uint, userID uint) error {
	var notification models.Notification
	if err := s.db.Where("id = ? AND user_id = ?", notificationID, userID).First(&notification).Error; err != nil {
		return err
	}

	notification.MarkAsRead()
	return s.db.Save(&notification).Error
}

// MarkAllAsRead marks all notifications as read for a user
func (s *NotificationService) MarkAllAsRead(userID uint) error {
	return s.db.Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Updates(map[string]interface{}{
			"is_read": true,
			"read_at": gorm.Expr("NOW()"),
		}).Error
}

// DeleteNotification deletes a notification
func (s *NotificationService) DeleteNotification(notificationID uint, userID uint) error {
	return s.db.Where("id = ? AND user_id = ?", notificationID, userID).Delete(&models.Notification{}).Error
}

// CreateBulkNotifications creates multiple notifications at once
func (s *NotificationService) CreateBulkNotifications(notifications []models.Notification) error {
	if len(notifications) == 0 {
		return nil
	}
	return s.db.Create(&notifications).Error
}

// NotifyAssignmentPublished creates notifications for all students in a course when an assignment is published
func (s *NotificationService) NotifyAssignmentPublished(assignmentID uint, courseID uint, assignmentTitle string) error {
	// Get all approved students in the course
	var enrollments []models.Enrollment
	if err := s.db.Where("course_id = ? AND status = ? AND role = ?", courseID, models.EnrollmentStatusApproved, models.RoleStudent).
		Find(&enrollments).Error; err != nil {
		return err
	}

	// Create notifications for each student
	notifications := make([]models.Notification, len(enrollments))
	for i, enrollment := range enrollments {
		relatedID := assignmentID
		notifications[i] = models.Notification{
			UserID:    enrollment.UserID,
			Title:     "New Assignment Published",
			Content:   "A new assignment '" + assignmentTitle + "' has been published",
			Type:      models.NotificationAssignmentPublished,
			IsRead:    false,
			RelatedID: &relatedID,
		}
	}

	return s.CreateBulkNotifications(notifications)
}

// NotifySubmissionGraded creates a notification when a submission is graded
func (s *NotificationService) NotifySubmissionGraded(studentID uint, assignmentTitle string, submissionID uint) error {
	relatedID := submissionID
	notification := &models.Notification{
		UserID:    studentID,
		Title:     "Assignment Graded",
		Content:   "Your submission for '" + assignmentTitle + "' has been graded",
		Type:      models.NotificationSubmissionGraded,
		IsRead:    false,
		RelatedID: &relatedID,
	}
	return s.CreateNotification(notification)
}

// NotifyEnrollmentApproved creates a notification when an enrollment is approved
func (s *NotificationService) NotifyEnrollmentApproved(userID uint, courseName string, courseID uint) error {
	relatedID := courseID
	notification := &models.Notification{
		UserID:    userID,
		Title:     "Enrollment Approved",
		Content:   "Your enrollment in '" + courseName + "' has been approved",
		Type:      models.NotificationEnrollmentApproved,
		IsRead:    false,
		RelatedID: &relatedID,
	}
	return s.CreateNotification(notification)
}

// NotifyEnrollmentRejected creates a notification when an enrollment is rejected
func (s *NotificationService) NotifyEnrollmentRejected(userID uint, courseName string, courseID uint) error {
	relatedID := courseID
	notification := &models.Notification{
		UserID:    userID,
		Title:     "Enrollment Rejected",
		Content:   "Your enrollment in '" + courseName + "' has been rejected",
		Type:      models.NotificationEnrollmentRejected,
		IsRead:    false,
		RelatedID: &relatedID,
	}
	return s.CreateNotification(notification)
}

// NotifyQuizAvailable creates notifications for all students when a quiz becomes available
func (s *NotificationService) NotifyQuizAvailable(quizID uint, courseID uint, quizTitle string) error {
	// Get all approved students in the course
	var enrollments []models.Enrollment
	if err := s.db.Where("course_id = ? AND status = ? AND role = ?", courseID, models.EnrollmentStatusApproved, models.RoleStudent).
		Find(&enrollments).Error; err != nil {
		return err
	}

	// Create notifications for each student
	notifications := make([]models.Notification, len(enrollments))
	for i, enrollment := range enrollments {
		relatedID := quizID
		notifications[i] = models.Notification{
			UserID:    enrollment.UserID,
			Title:     "New Quiz Available",
			Content:   "A new quiz '" + quizTitle + "' is now available",
			Type:      models.NotificationQuizAvailable,
			IsRead:    false,
			RelatedID: &relatedID,
		}
	}

	return s.CreateBulkNotifications(notifications)
}

// NotifyQuizGraded creates a notification when a quiz is graded (auto-graded or manual)
func (s *NotificationService) NotifyQuizGraded(studentID uint, quizTitle string, quizID uint) error {
	relatedID := quizID
	notification := &models.Notification{
		UserID:    studentID,
		Title:     "Quiz Graded",
		Content:   "Your quiz '" + quizTitle + "' has been graded",
		Type:      models.NotificationQuizGraded,
		IsRead:    false,
		RelatedID: &relatedID,
	}
	return s.CreateNotification(notification)
}
