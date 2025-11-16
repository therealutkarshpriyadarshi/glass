package services

import (
	"errors"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"server/app/firebase"
	"server/app/models"
	"slices"
	"sync"
)

type FileOptions struct {
	Path              string
	ExtensionsAllowed []string
}

// UploadFile uploads a file to Firebase Cloud Storage and returns a BaseFile model.
//
// Parameters:
//   - store: A pointer to the Firebase CloudStorage instance.
//   - file: A pointer to the multipart.FileHeader containing the file to be uploaded.
//   - options: FileOptions struct containing the upload path and allowed extensions.
//
// Returns:
//   - models.BaseFile: A BaseFile struct containing information about the uploaded file.
//   - error: An error if the upload fails, nil otherwise.
func UploadFile(store *firebase.CloudStorage, file *multipart.FileHeader, options FileOptions) (models.BaseFile, error) {

	var baseFile models.BaseFile
	attrs, err := store.UploadFile(file, options.Path)
	if err != nil {
		return baseFile, err
	}

	ext := filepath.Ext(file.Filename)

	if options.ExtensionsAllowed != nil && len(options.ExtensionsAllowed) > 0 {
		if !slices.Contains(options.ExtensionsAllowed, ext) {
			return baseFile, errors.New("file extension not allowed")
		}
	}

	baseFile = models.BaseFile{
		FileName:     attrs.Name,
		FileUrl:      attrs.MediaLink,
		Extension:    models.FileExtension(ext),
		UserFileName: file.Filename,
	}

	return baseFile, nil
}

// DeleteFiles deletes multiple files from Firebase Cloud Storage concurrently.
//
// Parameters:
//   - store: A pointer to the Firebase CloudStorage instance.
//   - files: A slice of models.BaseFile containing information about the files to be deleted.
//
// Returns:
//   - error: An error if any file deletion fails, nil if all files are deleted successfully.
//
// The function uses goroutines to delete files concurrently, improving performance for bulk deletions.
// If any errors occur during deletion, they are collected and returned as a single error message.
func DeleteFiles(store *firebase.CloudStorage, files []models.BaseFile) error {
	if len(files) == 0 {
		return nil
	}

	errChan := make(chan error, len(files))
	var wg sync.WaitGroup

	for _, file := range files {
		wg.Add(1)
		go func(file models.BaseFile) {
			defer wg.Done()
			if file.FileName == "" {
				errChan <- errors.New("empty file name")
				return
			}
			if err := store.DeleteFile(file.FileName); err != nil {
				errChan <- fmt.Errorf("failed to delete file %s: %w", file.FileName, err)
				return
			}
		}(file)
	}

	go func() {
		wg.Wait()
		close(errChan)
	}()

	var errs []error
	for err := range errChan {
		if err != nil {
			errs = append(errs, err)
		}
	}

	if len(errs) > 0 {
		return fmt.Errorf("failed to delete %d files: %v", len(errs), errs)
	}

	return nil
}

// UploadFiles uploads multiple files concurrently to Firebase Cloud Storage.
//
// Parameters:
//   - store: A pointer to the Firebase CloudStorage instance.
//   - files: A slice of multipart.FileHeader pointers representing the files to be uploaded.
//   - options: FileOptions struct containing upload configuration options.
//
// Returns:
//   - []models.BaseFile: A slice of BaseFile structs containing information about the uploaded files.
//   - error: An error if any file upload fails, nil if all files are uploaded successfully.
func UploadFiles(store *firebase.CloudStorage, files []*multipart.FileHeader, options FileOptions) ([]models.BaseFile, error) {
	baseFiles := make([]models.BaseFile, 0, len(files))
	errChan := make(chan error, len(files))
	var wg sync.WaitGroup

	for _, file := range files {
		wg.Add(1)
		go func(file *multipart.FileHeader) {
			defer wg.Done()
			baseFile, err := UploadFile(store, file, options)
			if err != nil {
				errChan <- err
				return
			}
			baseFiles = append(baseFiles, baseFile)
		}(file)
	}

	go func() {
		wg.Wait()
		close(errChan)
	}()

	var errs []error

	for err := range errChan {
		if err != nil {
			errs = append(errs, err)
		}
	}

	if len(errs) > 0 {
		return nil, fmt.Errorf("failed to upload %d files: %v", len(errs), errs)
	}

	return baseFiles, nil
}
