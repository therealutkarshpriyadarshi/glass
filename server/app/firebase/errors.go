package firebase

import "fmt"

type BucketError struct {
	err error
}

func InvalidBucket(err error) *BucketError {
	return &BucketError{err: err}
}

func (e *BucketError) Error() string {
	return fmt.Errorf("error getting bucket: %v", e.err).Error()
}

type DeleteFileError struct {
	err error
}

func NewDeleteFileError(err error) *DeleteFileError {
	return &DeleteFileError{err: err}
}

func (e *DeleteFileError) Error() string {
	return fmt.Errorf("error deleting file: %v", e.err).Error()
}
