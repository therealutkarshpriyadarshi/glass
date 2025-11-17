package routes

import (
	"server/app/handlers"
	"server/app/middlewares"
	"server/app/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupDashboardRoutes(router gin.IRouter, db *gorm.DB, secret string) {
	dashboardService := services.NewDashboardService(db)
	dashboardHandler := handlers.NewDashboardHandler(dashboardService)

	// Dashboard endpoint - requires authentication
	router.GET("/dashboard",
		middlewares.AuthMiddleware(secret),
		dashboardHandler.GetDashboardData)
}
