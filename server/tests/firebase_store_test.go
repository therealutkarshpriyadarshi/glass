// storage/cloud_storage_test.go

package tests

import (
	"bytes"
	"fmt"
	"log"
	"mime/multipart"
	"os"
	"server/app/firebase"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var (
	cs *firebase.CloudStorage
)

const (
	testDir = "test"
)

func TestMain(m *testing.M) {
	var err error
	cs, err = firebase.DefaultCloudStorage()
	if err != nil {
		log.Fatal(err)
	}
	code := m.Run()
	cleanupTestFiles()
	os.Exit(code)
}

func cleanupTestFiles() {
	files, err := cs.ListFiles("test-")
	if err != nil {
		fmt.Printf("error listing files for cleanup: %v\n", err)
		return
	}

	for _, file := range files {
		if err := cs.DeleteFile(file); err != nil {
			fmt.Printf("error deleting file %s: %v\n", file, err)
		}
	}

	if err := os.RemoveAll(testDir); err != nil {
		log.Fatalf("error removing test dir: %v", err)
	}
}

func createFileHeader(filename string, content []byte) (*multipart.FileHeader, error) {
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return nil, err
	}

	_, err = part.Write(content)
	if err != nil {
		return nil, fmt.Errorf("error writing file content: %w", err)
	}

	err = writer.Close()
	if err != nil {
		return nil, fmt.Errorf("error closing multipart writer: %w", err)
	}

	reader := multipart.NewReader(&body, writer.Boundary())
	form, err := reader.ReadForm(int64(body.Len()))
	if err != nil {
		return nil, fmt.Errorf("error reading multipart form: %w", err)
	}

	fileHeaders := form.File["file"]
	if len(fileHeaders) == 0 {
		return nil, fmt.Errorf("no file headers found")
	}

	return fileHeaders[0], nil
}

func createTestFile(name, content string) (*multipart.FileHeader, error) {
	return createFileHeader(name, []byte(content))
}

func TestUploadFile(t *testing.T) {
	file, err := createTestFile("test.txt", "Hello, World!")
	require.NoError(t, err)
	path := fmt.Sprintf("test-%d", time.Now().UnixNano())

	attrs, err := cs.UploadFile(file, path)

	require.NoError(t, err)
	assert.NotNil(t, attrs)
	assert.Contains(t, attrs.Name, path)
}

func TestDeleteFile(t *testing.T) {
	file, err := createTestFile("test-delete.txt", "Delete me")
	require.NoError(t, err)
	path := fmt.Sprintf("test-delete-%d", time.Now().UnixNano())

	attrs, err := cs.UploadFile(file, path)
	require.NoError(t, err)

	err = cs.DeleteFile(attrs.Name)
	assert.NoError(t, err)

	// Verify the file is deleted
	_, err = cs.GetFileURL(attrs.Name)
	assert.Error(t, err)
}

func TestGetFileURL(t *testing.T) {
	file, err := createTestFile("test-url.txt", "Get my URL")
	require.NoError(t, err)
	path := fmt.Sprintf("test-url-%d", time.Now().UnixNano())

	attrs, err := cs.UploadFile(file, path)
	require.NoError(t, err)

	url, err := cs.GetFileURL(attrs.Name)
	assert.NoError(t, err)
	assert.NotEmpty(t, url)
	assert.Contains(t, url, "https://")
}

func TestMoveFile(t *testing.T) {
	file, err := createTestFile("test-move.txt", "Move me")
	require.NoError(t, err)
	oldPath := fmt.Sprintf("test-move-old-%d", time.Now().UnixNano())
	newPath := fmt.Sprintf("test-move-new-%d", time.Now().UnixNano())

	attrs, err := cs.UploadFile(file, oldPath)
	require.NoError(t, err)

	err = cs.MoveFile(attrs.Name, newPath)
	assert.NoError(t, err)

	// Verify the file is moved
	_, err = cs.GetFileURL(attrs.Name)
	assert.Error(t, err)

	_, err = cs.GetFileURL(newPath)
	assert.NoError(t, err)
}

func TestListFiles(t *testing.T) {
	// Upload a few test files
	for i := 0; i < 3; i++ {
		file, err := createTestFile(fmt.Sprintf("test-list-%d.txt", i), "List me")
		require.NoError(t, err)
		path := fmt.Sprintf("test-list-%d", time.Now().UnixNano())
		_, err = cs.UploadFile(file, path)
		require.NoError(t, err)
	}

	files, err := cs.ListFiles("test-list-")
	assert.NoError(t, err)
	assert.GreaterOrEqual(t, len(files), 3)

	for _, file := range files {
		assert.True(t, strings.HasPrefix(file, "test-list-"))
	}
}

func TestNewCloudStorage(t *testing.T) {
	newCs, err := firebase.DefaultCloudStorage()
	assert.NoError(t, err)
	assert.NotNil(t, newCs)
}
