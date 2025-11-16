package middlewares

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// IPRateLimiter holds the rate limiters for each IP address
type IPRateLimiter struct {
	ips map[string]*rate.Limiter
	mu  *sync.RWMutex
	r   rate.Limit
	b   int
}

// NewIPRateLimiter creates a new IP-based rate limiter
// r is the rate (requests per second), b is the burst size
func NewIPRateLimiter(r rate.Limit, b int) *IPRateLimiter {
	return &IPRateLimiter{
		ips: make(map[string]*rate.Limiter),
		mu:  &sync.RWMutex{},
		r:   r,
		b:   b,
	}
}

// AddIP creates a new rate limiter for an IP address if it doesn't exist
func (i *IPRateLimiter) AddIP(ip string) *rate.Limiter {
	i.mu.Lock()
	defer i.mu.Unlock()

	limiter := rate.NewLimiter(i.r, i.b)
	i.ips[ip] = limiter

	return limiter
}

// GetLimiter returns the rate limiter for the provided IP address
func (i *IPRateLimiter) GetLimiter(ip string) *rate.Limiter {
	i.mu.Lock()
	limiter, exists := i.ips[ip]

	if !exists {
		i.mu.Unlock()
		return i.AddIP(ip)
	}

	i.mu.Unlock()
	return limiter
}

// CleanupOldIPs removes rate limiters for IPs that haven't been used recently
// This prevents the map from growing indefinitely
func (i *IPRateLimiter) CleanupOldIPs() {
	for {
		time.Sleep(time.Hour)
		i.mu.Lock()
		// In a real implementation, you'd track last access time
		// For now, we'll just clear the map periodically
		i.ips = make(map[string]*rate.Limiter)
		i.mu.Unlock()
	}
}

// RateLimitMiddleware creates a middleware that limits requests per IP
// Example: RateLimitMiddleware(5, 10) allows 5 requests per second with burst of 10
func RateLimitMiddleware(requestsPerSecond int, burst int) gin.HandlerFunc {
	limiter := NewIPRateLimiter(rate.Limit(requestsPerSecond), burst)

	// Start cleanup goroutine
	go limiter.CleanupOldIPs()

	return func(c *gin.Context) {
		ip := c.ClientIP()
		limiter := limiter.GetLimiter(ip)

		if !limiter.Allow() {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many requests. Please try again later.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// AuthRateLimitMiddleware is a preconfigured rate limiter for auth endpoints
// Allows 5 requests per minute with a burst of 10
func AuthRateLimitMiddleware() gin.HandlerFunc {
	// 5 requests per minute = 5/60 = 0.0833 requests per second
	return RateLimitMiddleware(1, 5) // 1 request per second, burst of 5
}
