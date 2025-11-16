package middlewares_test

import (
	"net/http"
	"net/http/httptest"
	"server/app/middlewares"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestRateLimitMiddleware(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("allows requests under rate limit", func(t *testing.T) {
		router := gin.New()
		router.Use(middlewares.RateLimitMiddleware(10, 10)) // 10 req/sec, burst 10
		router.GET("/test", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "ok"})
		})

		// Make 5 requests (under limit)
		for i := 0; i < 5; i++ {
			req := httptest.NewRequest(http.MethodGet, "/test", nil)
			req.RemoteAddr = "192.168.1.1:12345"
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, http.StatusOK, w.Code)
		}
	})

	t.Run("blocks requests over rate limit", func(t *testing.T) {
		router := gin.New()
		router.Use(middlewares.RateLimitMiddleware(1, 2)) // 1 req/sec, burst 2
		router.GET("/test", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "ok"})
		})

		// Make requests up to burst limit (should succeed)
		for i := 0; i < 2; i++ {
			req := httptest.NewRequest(http.MethodGet, "/test", nil)
			req.RemoteAddr = "192.168.1.2:12345"
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, http.StatusOK, w.Code)
		}

		// Next request should be rate limited
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		req.RemoteAddr = "192.168.1.2:12345"
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusTooManyRequests, w.Code)
	})

	t.Run("rate limits per IP address", func(t *testing.T) {
		router := gin.New()
		router.Use(middlewares.RateLimitMiddleware(1, 1)) // 1 req/sec, burst 1
		router.GET("/test", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "ok"})
		})

		// Request from IP 1 should succeed
		req1 := httptest.NewRequest(http.MethodGet, "/test", nil)
		req1.RemoteAddr = "192.168.1.3:12345"
		w1 := httptest.NewRecorder()
		router.ServeHTTP(w1, req1)
		assert.Equal(t, http.StatusOK, w1.Code)

		// Request from IP 2 should also succeed (different IP)
		req2 := httptest.NewRequest(http.MethodGet, "/test", nil)
		req2.RemoteAddr = "192.168.1.4:12345"
		w2 := httptest.NewRecorder()
		router.ServeHTTP(w2, req2)
		assert.Equal(t, http.StatusOK, w2.Code)

		// Second request from IP 1 should be rate limited
		req3 := httptest.NewRequest(http.MethodGet, "/test", nil)
		req3.RemoteAddr = "192.168.1.3:12345"
		w3 := httptest.NewRecorder()
		router.ServeHTTP(w3, req3)
		assert.Equal(t, http.StatusTooManyRequests, w3.Code)
	})

	t.Run("allows requests after rate limit window passes", func(t *testing.T) {
		router := gin.New()
		// Very strict limit for testing
		router.Use(middlewares.RateLimitMiddleware(10, 1)) // 10 req/sec, burst 1
		router.GET("/test", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "ok"})
		})

		// First request should succeed
		req1 := httptest.NewRequest(http.MethodGet, "/test", nil)
		req1.RemoteAddr = "192.168.1.5:12345"
		w1 := httptest.NewRecorder()
		router.ServeHTTP(w1, req1)
		assert.Equal(t, http.StatusOK, w1.Code)

		// Immediate second request should be rate limited
		req2 := httptest.NewRequest(http.MethodGet, "/test", nil)
		req2.RemoteAddr = "192.168.1.5:12345"
		w2 := httptest.NewRecorder()
		router.ServeHTTP(w2, req2)
		assert.Equal(t, http.StatusTooManyRequests, w2.Code)

		// Wait for rate limit to reset (100ms for 10 req/sec)
		time.Sleep(150 * time.Millisecond)

		// Request should succeed again
		req3 := httptest.NewRequest(http.MethodGet, "/test", nil)
		req3.RemoteAddr = "192.168.1.5:12345"
		w3 := httptest.NewRecorder()
		router.ServeHTTP(w3, req3)
		assert.Equal(t, http.StatusOK, w3.Code)
	})
}

func TestAuthRateLimitMiddleware(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("applies appropriate rate limiting for auth endpoints", func(t *testing.T) {
		router := gin.New()
		router.Use(middlewares.AuthRateLimitMiddleware())
		router.POST("/login", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "ok"})
		})

		// Should allow up to burst limit
		for i := 0; i < 5; i++ {
			req := httptest.NewRequest(http.MethodPost, "/login", nil)
			req.RemoteAddr = "192.168.1.10:12345"
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, http.StatusOK, w.Code)
		}

		// Next request should be rate limited
		req := httptest.NewRequest(http.MethodPost, "/login", nil)
		req.RemoteAddr = "192.168.1.10:12345"
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusTooManyRequests, w.Code)
	})
}
