# Security Fixes Test Suite

This test suite validates all the critical security improvements made to the backend.

## Test Coverage

### 1. JWT Migration Tests (`services/user_service_test.go`)
- ✅ JWT v5 token generation with proper claims
- ✅ Token verification and validation
- ✅ User authentication flow
- ✅ Password change functionality
- ✅ Token expiration handling

### 2. Password Hashing Tests (`models/user_model_test.go`)
- ✅ Password hashing on user creation
- ✅ Prevention of double-hashing on updates
- ✅ New password hashing on password change
- ✅ Password verification (CheckPassword method)
- ✅ Bcrypt hash detection

### 3. Rate Limiting Tests (`middlewares/ratelimit_test.go`)
- ✅ Request allowance under rate limit
- ✅ Request blocking over rate limit
- ✅ Per-IP rate limiting
- ✅ Rate limit window reset
- ✅ Auth endpoint specific rate limiting

### 4. Integration Tests (`integration/auth_integration_test.go`)
- ✅ User registration with validation
- ✅ Email format validation
- ✅ Password strength validation
- ✅ Required field validation
- ✅ Name length validation
- ✅ Login with correct/incorrect credentials
- ✅ Protected route access control
- ✅ JWT token authorization
- ✅ Rate limiting on auth endpoints

## Running Tests

### Prerequisites
- PostgreSQL database running
- Test database: `glass_test`
- Database credentials: `user=postgres password=pswrd`

### Run All Tests
```bash
cd server
go test ./tests/... -v
```

### Run Specific Test Suites
```bash
# User service tests
go test ./tests/services/... -v

# Model tests
go test ./tests/models/... -v

# Middleware tests
go test ./tests/middlewares/... -v

# Integration tests
go test ./tests/integration/... -v
```

### Run with Coverage
```bash
go test ./tests/... -v -cover -coverprofile=coverage.out
go tool cover -html=coverage.out -o coverage.html
```

## Security Improvements Tested

### 1. Deprecated JWT Library Migration
**Issue**: Using deprecated `dgrijalva/jwt-go` with known vulnerabilities
**Fix**: Migrated to `golang-jwt/jwt/v5`
**Tests**: All JWT-related tests in `user_service_test.go`

### 2. Password Double-Hashing Issue
**Issue**: BeforeSave hook re-hashed already hashed passwords
**Fix**: Added `isPasswordHashed()` check before hashing
**Tests**: `user_model_test.go` - double-hashing prevention tests

### 3. Input Validation
**Issue**: No validation for email format, password strength, required fields
**Fix**: Added validation structs with comprehensive validation rules
**Tests**: Integration tests for all validation scenarios

### 4. Rate Limiting
**Issue**: Auth endpoints vulnerable to brute force attacks
**Fix**: Implemented IP-based rate limiting middleware
**Tests**: `ratelimit_test.go` and integration rate limit tests

### 5. CORS Configuration
**Issue**: CORS was commented out and not properly configured
**Fix**: Proper CORS configuration with environment-based origins
**Tests**: (Manual testing required for CORS headers)

## Test Database Setup

Create the test database:
```sql
CREATE DATABASE glass_test;
```

The tests will automatically create and drop tables as needed.

## Continuous Integration

These tests should be run on every commit to ensure security fixes remain intact:

```yaml
# Example GitHub Actions workflow
- name: Run security tests
  run: |
    cd server
    go test ./tests/... -v -cover
```

## Notes

- All tests use isolated database instances
- Tests clean up after themselves (drop tables)
- Rate limiting tests include timing-based tests
- Integration tests cover complete auth flow
