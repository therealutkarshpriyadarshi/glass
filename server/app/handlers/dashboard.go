package handlers

import (
	"net/http"
	"server/app/services"

	"github.com/gin-gonic/gin"
)

type DashboardHandler struct {
	dashboardService *services.DashboardService
}

func NewDashboardHandler(dashboardService *services.DashboardService) *DashboardHandler {
	return &DashboardHandler{dashboardService: dashboardService}
}

// GetDashboardData handles retrieving dashboard data for the authenticated user
func (h *DashboardHandler) GetDashboardData(c *gin.Context) {
	// Get the authenticated user ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get dashboard data
	data, err := h.dashboardService.GetDashboardData(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve dashboard data"})
		return
	}

	c.JSON(http.StatusOK, data)
}
