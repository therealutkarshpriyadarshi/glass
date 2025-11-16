package routes

import (
	"server/app/firebase"
	"server/app/handlers"
	"server/app/middlewares"
	"server/app/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupMaterialRoutes(r gin.IRouter, db *gorm.DB, storage *firebase.CloudStorage, secret string) {
	serv := services.NewMaterialService(db, storage)
	handler := handlers.NewMaterialHandler(serv)

	router := r.Group("/materials")
	router.Use(middlewares.AuthMiddleware(secret))
	{
		// Public (authenticated) endpoints
		router.GET("/:id", handler.GetMaterial)
		router.POST("/", handler.CreateMaterial) // Note: Should ideally check course ownership
		router.GET("/course/:courseId", handler.GetMaterialsByCourse)

		// Protected endpoints - require material ownership (teacher/admin of the course)
		router.PUT("/:id",
			middlewares.MaterialOwnershipMiddleware(db),
			handler.UpdateMaterial)
		router.DELETE("/:id",
			middlewares.MaterialOwnershipMiddleware(db),
			handler.DeleteMaterial)
	}
}
