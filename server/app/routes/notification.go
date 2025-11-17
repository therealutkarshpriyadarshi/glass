package routes

import (
	"server/app/handlers"
	"server/app/middlewares"
	"server/app/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SetupNotificationRoutes sets up all notification-related routes
func SetupNotificationRoutes(r gin.IRouter, db *gorm.DB, secret string) {
	notificationService := services.NewNotificationService(db)
	notificationHandler := handlers.NewNotificationHandler(notificationService)

	notifications := r.Group("/notifications")
	notifications.Use(middlewares.AuthMiddleware(secret))
	{
		// Get all notifications for the authenticated user
		notifications.GET("", notificationHandler.GetUserNotifications)

		// Get unread notifications
		notifications.GET("/unread", notificationHandler.GetUnreadNotifications)

		// Get unread count
		notifications.GET("/unread/count", notificationHandler.GetUnreadCount)

		// Mark a specific notification as read
		notifications.PUT("/:id/read", notificationHandler.MarkAsRead)

		// Mark all notifications as read
		notifications.PUT("/read-all", notificationHandler.MarkAllAsRead)

		// Delete a notification
		notifications.DELETE("/:id", notificationHandler.DeleteNotification)
	}
}
