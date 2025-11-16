package apperror

type InvalidCredential struct {
}

func (i InvalidCredential) Error() string {
	return "Invalid credentials"
}

type SigningMethodError struct {
}

func (s SigningMethodError) Error() string {
	return "unexpected signing method"
}

type InvalidToken struct {
}

func (i InvalidToken) Error() string {
	return "invalid token"
}
