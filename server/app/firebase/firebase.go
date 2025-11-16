package firebase

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"

	firebase "firebase.google.com/go/v4"
	"google.golang.org/api/option"
)

// InitializeFirebase initializes and returns a new Firebase App instance.
//
// Returns:
//   - *firebase.App: A pointer to the initialized Firebase App instance.
//   - error: An error if any step in the initialization process fails.
func InitializeFirebase() (*firebase.App, error) {
	ctx := context.Background()

	dir := currentDir()
	filePath := filepath.Join(dir, "google-credentials.json")
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil, fmt.Errorf("credentials file not found: %v", err)
	}

	conf := option.WithCredentialsFile(filePath)
	app, err := firebase.NewApp(ctx, nil, conf)

	if err != nil {
		return nil, fmt.Errorf("error initializing app: %v", err)
	}

	if app == nil {
		log.Fatalln("error initializing app: app is nil")
	}

	return app, nil
}

// currentDir returns the current directory of the file that calls it.
func currentDir() string {
	_, filename, _, ok := runtime.Caller(0)
	if !ok {
		return ""
	}

	dir := filepath.Dir(filename)
	return dir
}
