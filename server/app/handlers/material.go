package handlers

import (
	"net/http"
	"server/app/models"
	"server/app/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type MaterialHandler struct {
	serv *services.MaterialService
}

func NewMaterialHandler(serv *services.MaterialService) *MaterialHandler {
	return &MaterialHandler{serv: serv}
}

// GetMaterial retrieves a material by its ID.
//
// Parameters:
//   - c: The Gin context for the current request.
//
// The function expects a material ID as a URL parameter.
// It returns the material as JSON if found, or an appropriate error response.
func (h *MaterialHandler) GetMaterial(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param(MaterialIDKey), 10, 64)
	if err != nil {
		HandleBadRequest(c, InvalidMaterialID)
		return
	}

	material, err := h.serv.GetMaterial(uint(id))
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(http.StatusOK, material)
}

// DeleteMaterial deletes a material by its ID.
//
// Parameters:
//   - c: The Gin context for the current request.
//
// The function expects a material ID as a URL parameter.
// It returns a success message if the material is deleted, or an appropriate error response.
func (h *MaterialHandler) DeleteMaterial(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param(MaterialIDKey), 10, 64)
	if err != nil {
		HandleBadRequest(c, InvalidMaterialID)
		return
	}

	if err := h.serv.DeleteMaterial(uint(id)); err != nil {
		SendError(err, c)
		return
	}

	HandleDeleted(c, "Material deleted successfully")
}

// CreateMaterial creates a new material with associated files.
//
// Parameters:
//   - c: The Gin context for the current request.
//
// The function expects a multipart form with title, description, and files.
// It returns the created material as JSON if successful, or an appropriate error response.
func (h *MaterialHandler) CreateMaterial(c *gin.Context) {
	var material struct {
		Title       string   `form:"title" binding:"required"`
		Description string   `form:"description" binding:"required"`
		Files       []string `form:"files" binding:"required"`
	}

	if err := c.ShouldBind(&material); err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	files, err := ParseFiles(c)
	if err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	if len(files) != len(material.Files) {
		HandleBadRequest(c, "No files uploaded")
		return
	}

	mat := &models.Material{
		Title:       material.Title,
		Description: material.Description,
	}

	mat, err = h.serv.CreateMaterial(mat, files)
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(http.StatusCreated, gin.H{"material": *mat})
}

// UpdateMaterial updates an existing material and its associated files.
//
// Parameters:
//   - c: The Gin context for the current request.
//
// The function expects a material ID as a URL parameter and a multipart form with
// updated title, description, files to add, and file IDs to remove.
// It returns the updated material as JSON if successful, or an appropriate error response.
func (h *MaterialHandler) UpdateMaterial(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param(MaterialIDKey), 10, 64)
	if err != nil {
		HandleBadRequest(c, InvalidMaterialID)
		return
	}

	var updateData struct {
		Title       string `form:"title" binding:"required"`
		Description string `form:"description" binding:"required"`
		RemoveFiles []uint `form:"removeFiles[]" binding:"required"`
	}

	if err := c.ShouldBind(&updateData); err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	material, err := h.serv.GetMaterial(uint(id))
	if err != nil {
		SendError(err, c)
		return
	}

	material.Title = updateData.Title
	material.Description = updateData.Description

	filesToAdd, err := ParseFiles(c)
	if err != nil {
		HandleBadRequest(c, err.Error())
		return
	}

	filesToRemove := updateData.RemoveFiles

	err = h.serv.UpdateMaterial(material, filesToAdd, filesToRemove)
	if err != nil {
		SendError(err, c)
		return
	}

	c.JSON(http.StatusOK, gin.H{"material": *material})
}
