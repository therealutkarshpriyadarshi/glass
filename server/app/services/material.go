package services

import (
	"errors"
	"fmt"
	"mime/multipart"
	"server/app/firebase"
	"server/app/models"
	"sync"

	"gorm.io/gorm"
)

type MaterialService struct {
	db        *gorm.DB
	fileStore *firebase.CloudStorage
}

func NewMaterialService(db *gorm.DB, fileStore *firebase.CloudStorage) *MaterialService {
	return &MaterialService{db: db, fileStore: fileStore}
}

// GetMaterial retrieves a material by its ID from the database.
//
// Parameters:
//   - id: The unique identifier of the material to retrieve.
//
// Returns:
//   - *models.Material: A pointer to the retrieved material.
//   - error: An error if the retrieval fails, nil otherwise.
func (m *MaterialService) GetMaterial(id uint) (*models.Material, error) {
	var material models.Material
	if err := m.db.Preload("Files").First(&material, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, EntityNotFound(err)
		}
		return nil, fmt.Errorf("error retrieving material: %w", err)
	}
	return &material, nil
}

// CreateMaterial creates a new material in the database and associates files with it.
//
// Parameters:
//   - material: A pointer to the models.Material struct containing the material information.
//   - files: A slice of multipart.FileHeader pointers representing the files to be associated with the material.
//
// Returns:
//   - *models.Material: A pointer to the created material.
//   - error: An error if the creation fails, nil otherwise.
func (m *MaterialService) CreateMaterial(material *models.Material, files []*multipart.FileHeader) (*models.Material, error) {
	err := m.db.Transaction(func(db *gorm.DB) error {
		if err := db.Create(material).Error; err != nil {
			return CreateEntityFailure(err)
		}

		err := m.addFiles(db, material.ID, files)
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return material, nil
}

// DeleteMaterial deletes a material and its associated files from the database and storage.
//
// Parameters:
//   - id: The unique identifier of the material to be deleted.
//
// Returns:
//   - error: An error if the deletion fails, nil otherwise.
func (m *MaterialService) DeleteMaterial(id uint) error {
	return m.db.Transaction(func(db *gorm.DB) error {
		var material models.Material
		if err := db.Preload("Files").First(&material, id).Error; err != nil {
			return err
		}

		baseFiles := make([]models.BaseFile, len(material.Files))
		for i, file := range material.Files {
			baseFiles[i] = file.BaseFile
		}

		if err := DeleteFiles(m.fileStore, baseFiles); err != nil {
			return err
		}

		return db.Delete(&material).Error
	})
}

// UpdateMaterial updates an existing material with new information and manages associated files.
//
// Parameters:
//   - material: A pointer to the models.Material struct containing updated information.
//   - filesToAdd: A slice of multipart.FileHeader pointers representing new files to be added.
//   - fileIDsToRemove: A slice of uint representing IDs of files to be removed.
//
// Returns:
//   - error: An error if the update fails, nil otherwise.
func (m *MaterialService) UpdateMaterial(material *models.Material, filesToAdd []*multipart.FileHeader, fileIDsToRemove []uint) error {
	return m.db.Transaction(func(tx *gorm.DB) error {
		updateMaterial := models.Material{
			Title:       material.Title,
			Description: material.Description,
		}
		if err := tx.Model(material).Updates(updateMaterial).Error; err != nil {
			return UpdateEntityFailure(err)
		}
		id := material.ID

		var wg sync.WaitGroup
		errChan := make(chan error, 2)

		wg.Add(2)
		go func() {
			defer wg.Done()
			if err := m.addFiles(tx, id, filesToAdd); err != nil {
				errChan <- err
			}
		}()

		go func() {
			defer wg.Done()
			if err := m.removeFiles(tx, id, fileIDsToRemove); err != nil {
				errChan <- err
			}
		}()

		go func() {
			wg.Wait()
			close(errChan)
		}()

		for err := range errChan {
			if err != nil {
				return err
			}
		}

		return nil
	})
}

// addFiles uploads new files and associates them with a material.
//
// Parameters:
//   - tx: A pointer to the gorm.DB transaction.
//   - materialID: The ID of the material to associate the files with.
//   - files: A slice of multipart.FileHeader pointers representing the files to be added.
//
// Returns:
//   - error: An error if the file addition fails, nil otherwise.
func (m *MaterialService) addFiles(tx *gorm.DB, materialID uint, files []*multipart.FileHeader) error {
	if len(files) == 0 {
		return nil
	}

	options := FileOptions{
		Path: "materials",
	}

	uploadedFiles, err := UploadFiles(m.fileStore, files, options)
	if err != nil {
		return err
	}

	materialFiles := make([]*models.MaterialFile, 0, len(uploadedFiles))
	for _, file := range uploadedFiles {
		materialFiles = append(materialFiles, &models.MaterialFile{
			MaterialId: materialID,
			BaseFile:   file,
		})
	}

	if err := tx.Create(&materialFiles).Error; err != nil {
		return CreateEntityFailure(err)
	}

	return nil
}

// removeFiles removes specified files associated with a material.
//
// Parameters:
//   - tx: A pointer to the gorm.DB transaction.
//   - materialID: The ID of the material from which to remove files.
//   - fileIDs: A slice of uint representing the IDs of files to be removed.
//
// Returns:
//   - error: An error if the file removal fails, nil otherwise.
func (m *MaterialService) removeFiles(tx *gorm.DB, materialID uint, fileIDs []uint) error {
	if len(fileIDs) == 0 {
		return nil
	}

	filesToRemove := make([]*models.MaterialFile, 0, len(fileIDs))
	err := tx.Where("material_id = ? AND id IN ?", materialID, fileIDs).
		Find(&filesToRemove).Error
	if err != nil {
		return fmt.Errorf("error finding files to remove: %w", err)
	}

	if len(filesToRemove) == 0 {
		return nil
	}

	baseFiles := make([]models.BaseFile, len(filesToRemove))
	for i, file := range filesToRemove {
		baseFiles[i] = file.BaseFile
	}

	if err := DeleteFiles(m.fileStore, baseFiles); err != nil {
		return err
	}

	if err := tx.Delete(&filesToRemove).Error; err != nil {
		return DeleteEntityFailure(err)
	}

	return nil
}
