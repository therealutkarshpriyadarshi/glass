package firebase

import (
	"context"
	"errors"
	"fmt"
	"google.golang.org/api/iterator"
	"io"
	"log"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"

	googleStorage "cloud.google.com/go/storage"
	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/storage"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

type CloudStorage struct {
	app    *firebase.App
	client *storage.Client
	bucket string
}

// NewCloudStorage creates a new CloudStorage instance with the given Firebase app and bucket.
//
// Parameters:
//   - app: A pointer to the Firebase app instance.
//   - bucket: The name of the Firebase Storage bucket to use.
//
// Returns:
//   - *CloudStorage: A pointer to the new CloudStorage instance.
//   - error: An error if the storage client initialization fails.
func NewCloudStorage(app *firebase.App, bucket string) (*CloudStorage, error) {
	client, err := app.Storage(context.Background())
	if err != nil {
		return nil, err
	}

	if client == nil {
		log.Fatal("error initializing storage client: client is nil")
	}
	return &CloudStorage{
		app:    app,
		client: client,
		bucket: bucket,
	}, nil
}

// DefaultCloudStorage creates a new CloudStorage instance using default Firebase configuration.
//
// This function initializes Firebase, loads environment variables, and creates a CloudStorage
// instance with the default bucket specified in the environment.
//
// Returns:
//   - *CloudStorage: A pointer to the new CloudStorage instance.
//   - error: An error if any step in the initialization process fails.
func DefaultCloudStorage() (*CloudStorage, error) {
	app, err := InitializeFirebase()
	if err != nil {
		return nil, err
	}

	envPath := filepath.Join(currentDir(), "..", "..", ".env")
	if _, err := os.Stat(envPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("environment file not found: %v", err)
	}

	if err := godotenv.Load(envPath); err != nil {
		return nil, fmt.Errorf("error loading environment file: %v", err)
	}

	bucket := os.Getenv("FIREBASE_STORAGE_BUCKET")
	if bucket == "" {
		return nil, errors.New("FIREBASE_STORAGE_BUCKET environment variable not set")
	}

	return NewCloudStorage(app, bucket)
}

// UploadFile uploads a file to Firebase Storage.
//
// Parameters:
//   - file: A pointer to the multipart.FileHeader of the file to upload.
//   - path: The path in the storage bucket where the file should be stored.
//
// Returns:
//   - *googleStorage.ObjectAttrs: The attributes of the uploaded file.
//   - error: An error if the upload process fails.
func (s *CloudStorage) UploadFile(file *multipart.FileHeader, path string) (*googleStorage.ObjectAttrs, error) {
	ctx := context.Background()
	fmt.Println(file.Filename)
	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("error opening file: %v", err)
	}

	defer func(src multipart.File) {
		err := src.Close()
		if err != nil {
			fmt.Printf("error closing file: %v\n", err)
		}
	}(src)

	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%s_%s%s", time.Now().Format("20060102150405"), uuid.New().String(), ext)
	fullPath := filepath.Join(path, filename)

	bucket, err := s.client.Bucket(s.bucket)
	if err != nil {
		return nil, err
	}

	obj := bucket.Object(fullPath)
	writer := obj.NewWriter(ctx)

	// Copy the file data to Firebase Storage
	if _, err = io.Copy(writer, src); err != nil {
		return nil, fmt.Errorf("error copying file to firebase: %v", err)
	}

	if err := writer.Close(); err != nil {
		return nil, fmt.Errorf("error closing writer: %v", err)
	}

	role := googleStorage.RoleReader
	if err := obj.ACL().Set(ctx, googleStorage.AllUsers, role); err != nil {
		return nil, fmt.Errorf("error setting file to public: %v", err)
	}

	return obj.Attrs(ctx)
}

// DeleteFile deletes a file from Firebase Storage.
//
// Parameters:
//   - path: The path of the file to delete in the storage bucket.
//
// Returns:
//   - error: An error if the deletion process fails.
func (s *CloudStorage) DeleteFile(path string) error {
	ctx := context.Background()

	bucket, err := s.client.Bucket(s.bucket)
	if err != nil {
		return InvalidBucket(err)
	}

	obj := bucket.Object(path)
	if err := obj.Delete(ctx); err != nil {
		return NewDeleteFileError(err)
	}

	return nil
}

// GetFileURL retrieves the public URL of a file in Firebase Storage.
//
// Parameters:
//   - path: The path of the file in the storage bucket.
//
// Returns:
//   - string: The public URL of the file.
//   - error: An error if retrieving the URL fails.
func (s *CloudStorage) GetFileURL(path string) (string, error) {
	ctx := context.Background()

	bucket, err := s.client.Bucket(s.bucket)
	if err != nil {
		return "", InvalidBucket(err)
	}

	obj := bucket.Object(path)
	attrs, err := obj.Attrs(ctx)
	if err != nil {
		return "", fmt.Errorf("error getting file attributes: %v", err)
	}

	return attrs.MediaLink, nil
}

// MoveFile moves a file from one location to another in Firebase Storage.
//
// Parameters:
//   - oldPath: The current path of the file in the storage bucket.
//   - newPath: The new path where the file should be moved to.
//
// Returns:
//   - error: An error if the move process fails.
func (s *CloudStorage) MoveFile(oldPath, newPath string) error {
	ctx := context.Background()

	bucket, err := s.client.Bucket(s.bucket)
	if err != nil {
		return InvalidBucket(err)
	}

	src := bucket.Object(oldPath)
	dst := bucket.Object(newPath)

	if _, err := dst.CopierFrom(src).Run(ctx); err != nil {
		return fmt.Errorf("error copying file: %v", err)
	}

	if err := src.Delete(ctx); err != nil {
		return NewDeleteFileError(err)
	}

	return nil
}

// ListFiles lists all files in a specific path in Firebase Storage.
//
// Parameters:
//   - path: The path in the storage bucket to list files from.
//
// Returns:
//   - []string: A slice of file names in the specified path.
//   - error: An error if the listing process fails.
func (s *CloudStorage) ListFiles(path string) ([]string, error) {
	ctx := context.Background()

	bucket, err := s.client.Bucket(s.bucket)
	if err != nil {
		return nil, InvalidBucket(err)
	}

	var fileList []string
	it := bucket.Objects(ctx, &googleStorage.Query{Prefix: path})
	for {
		attrs, err := it.Next()
		fmt.Println(len(fileList))

		if errors.Is(err, iterator.Done) {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("error listing files: %v", err)
		}

		fileList = append(fileList, attrs.Name)
	}

	return fileList, nil
}
