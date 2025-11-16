package services

import "fmt"

type EntityNotFoundError struct {
	err error
}

func EntityNotFound(err error) EntityNotFoundError {
	return EntityNotFoundError{err: err}
}

func (e EntityNotFoundError) Error() string {
	return fmt.Errorf("entity not found: %v", e.err).Error()
}

type CreateEntityFailureError struct {
	err error
}

func CreateEntityFailure(err error) CreateEntityFailureError {
	return CreateEntityFailureError{err: err}
}

func (e CreateEntityFailureError) Error() string {
	return fmt.Errorf("error creating entity: %v", e.err).Error()
}

type UpdateEntityFailureError struct {
	err error
}

func UpdateEntityFailure(err error) UpdateEntityFailureError {
	return UpdateEntityFailureError{err: err}
}

func (e UpdateEntityFailureError) Error() string {
	return fmt.Errorf("error updating entity: %v", e.err).Error()
}

type DeleteEntityFailureError struct {
	err error
}

func DeleteEntityFailure(err error) DeleteEntityFailureError {
	return DeleteEntityFailureError{err: err}
}

func (e DeleteEntityFailureError) Error() string {
	return fmt.Errorf("error deleting entity: %v", e.err).Error()
}

type DeleteFileFailureError struct {
	err error
}

func DeleteFileFailure(err error) DeleteFileFailureError {
	return DeleteFileFailureError{err: err}
}

func (e DeleteFileFailureError) Error() string {
	return fmt.Errorf("error deleting file: %v", e.err).Error()
}

type PermissionDeniedError struct {
}

func PermissionDenied() PermissionDeniedError {
	return PermissionDeniedError{}
}

func (e PermissionDeniedError) Error() string {
	return "permission denied"
}

type CannotPerformActionError struct {
	action string
}

func CannotPerformAction(action string) CannotPerformActionError {
	return CannotPerformActionError{action: action}
}

func (e CannotPerformActionError) Error() string {
	return fmt.Sprintf("cannot perform action: %v", e.action)
}
