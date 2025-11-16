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
		router.GET("/:id", handler.GetMaterial)
		router.POST("/", handler.CreateMaterial)
		router.PUT("/:id", handler.UpdateMaterial)
		router.DELETE("/:id", handler.DeleteMaterial)
	}
}
