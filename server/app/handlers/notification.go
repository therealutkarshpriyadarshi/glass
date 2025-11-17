package handlers

import (
	"net/http"
	"server/app/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

// NotificationHandler handles HTTP requests related to notifications
type NotificationHandler struct {
	serv *services.NotificationService
}

// NewNotificationHandler creates a new NotificationHandler instance
func NewNotificationHandler(serv *services.NotificationService) *NotificationHandler {
	return &NotificationHandler{serv: serv}
}

// GetUserNotifications retrieves all notifications for the authenticated user with pagination
func (h *NotificationHandler) GetUserNotifications(c *gin.Context) {
	userID := c.GetUint("userID")

	// Parse pagination parameters
	limit := 20 // default
	offset := 0 // default

	if limitStr := c.Query("limit"); limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	if offsetStr := c.Query("offset"); offsetStr != "" {
		if parsedOffset, err := strconv.Atoi(offsetStr); err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}

	notifications, total, err := h.serv.GetUserNotifications(userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notifications"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"notifications": notifications,
		"total":         total,
		"limit":         limit,
		"offset":        offset,
	})
}

// GetUnreadNotifications retrieves all unread notifications for the authenticated user
func (h *NotificationHandler) GetUnreadNotifications(c *gin.Context) {
	userID := c.GetUint("userID")

	notifications, err := h.serv.GetUnreadNotifications(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch unread notifications"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"notifications": notifications,
		"count":         len(notifications),
	})
}

// GetUnreadCount retrieves the count of unread notifications for the authenticated user
func (h *NotificationHandler) GetUnreadCount(c *gin.Context) {
	userID := c.GetUint("userID")

	count, err := h.serv.GetUnreadCount(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch unread count"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"count": count,
	})
}

// MarkAsRead marks a specific notification as read
func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
	userID := c.GetUint("userID")
	notificationID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification ID"})
		return
	}

	if err := h.serv.MarkAsRead(uint(notificationID), userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark notification as read"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification marked as read"})
}

// MarkAllAsRead marks all notifications as read for the authenticated user
func (h *NotificationHandler) MarkAllAsRead(c *gin.Context) {
	userID := c.GetUint("userID")

	if err := h.serv.MarkAllAsRead(userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark all notifications as read"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "All notifications marked as read"})
}

// DeleteNotification deletes a specific notification
func (h *NotificationHandler) DeleteNotification(c *gin.Context) {
	userID := c.GetUint("userID")
	notificationID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification ID"})
		return
	}

	if err := h.serv.DeleteNotification(uint(notificationID), userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification deleted"})
}
