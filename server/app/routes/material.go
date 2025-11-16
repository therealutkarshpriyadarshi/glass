package routes

import (
	"server/app/firebase"
	"server/app/handlers"
	"server/app/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupMaterialRoutes(r *gin.Engine, db *gorm.DB, storage *firebase.CloudStorage) {
	serv := services.NewMaterialService(db, storage)
	handler := handlers.NewMaterialHandler(serv)

	router := r.Group("/materials")
	{
		router.GET("/:id", handler.GetMaterial)
		router.POST("/", handler.CreateMaterial)
		router.PUT("/:id", handler.UpdateMaterial)
		router.DELETE("/:id", handler.DeleteMaterial)
	}
}
