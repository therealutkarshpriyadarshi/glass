package services

import (
	"server/app/models"
	"time"

	"gorm.io/gorm"
)

type DashboardService struct {
	db *gorm.DB
}

func NewDashboardService(db *gorm.DB) *DashboardService {
	return &DashboardService{db: db}
}

// DashboardAssignment represents a simplified assignment for the dashboard
type DashboardAssignment struct {
	ID      uint   `json:"id"`
	Title   string `json:"title"`
	DueDate string `json:"dueDate"`
}

// DashboardAnnouncement represents an announcement (using materials)
type DashboardAnnouncement struct {
	ID      uint   `json:"id"`
	Title   string `json:"title"`
	Content string `json:"content"`
}

// DashboardStats represents the statistics for the dashboard
type DashboardStats struct {
	ActiveCourses        int `json:"activeCourses"`
	UpcomingAssignments  int `json:"upcomingAssignments"`
	NewMessages          int `json:"newMessages"`
}

// DashboardData represents the complete dashboard data
type DashboardData struct {
	UpcomingAssignments  []DashboardAssignment   `json:"upcomingAssignments"`
	RecentAnnouncements  []DashboardAnnouncement `json:"recentAnnouncements"`
	CourseStats          DashboardStats          `json:"courseStats"`
}

// GetDashboardData retrieves all dashboard data for a user
func (s *DashboardService) GetDashboardData(userID uint) (*DashboardData, error) {
	data := &DashboardData{
		UpcomingAssignments: []DashboardAssignment{},
		RecentAnnouncements: []DashboardAnnouncement{},
		CourseStats: DashboardStats{
			NewMessages: 0, // Placeholder for future messaging feature
		},
	}

	// Get upcoming assignments
	assignments, err := s.getUpcomingAssignments(userID)
	if err != nil {
		return nil, err
	}
	data.UpcomingAssignments = assignments

	// Get recent announcements (using materials as announcements)
	announcements, err := s.getRecentAnnouncements(userID)
	if err != nil {
		return nil, err
	}
	data.RecentAnnouncements = announcements

	// Get course stats
	stats, err := s.getCourseStats(userID)
	if err != nil {
		return nil, err
	}
	data.CourseStats = stats

	return data, nil
}

// getUpcomingAssignments retrieves upcoming assignments for a user
func (s *DashboardService) getUpcomingAssignments(userID uint) ([]DashboardAssignment, error) {
	var assignments []models.Assignment
	err := s.db.Joins("JOIN enrollments ON enrollments.course_id = assignments.course_id").
		Where("enrollments.user_id = ? AND enrollments.status = ? AND assignments.due_date > ? AND assignments.is_published = ?",
			userID, models.EnrollmentStatusApproved, time.Now(), true).
		Order("assignments.due_date ASC").
		Limit(5).
		Find(&assignments).Error

	if err != nil {
		return nil, err
	}

	// Convert to dashboard assignments
	dashboardAssignments := make([]DashboardAssignment, 0, len(assignments))
	for _, a := range assignments {
		dashboardAssignments = append(dashboardAssignments, DashboardAssignment{
			ID:      a.ID,
			Title:   a.Title,
			DueDate: a.DueDate.Format("2006-01-02"),
		})
	}

	return dashboardAssignments, nil
}

// getRecentAnnouncements retrieves recent materials as announcements
func (s *DashboardService) getRecentAnnouncements(userID uint) ([]DashboardAnnouncement, error) {
	var materials []models.Material
	err := s.db.Joins("JOIN enrollments ON enrollments.course_id = materials.course_id").
		Where("enrollments.user_id = ? AND enrollments.status = ?", userID, models.EnrollmentStatusApproved).
		Order("materials.created_at DESC").
		Limit(5).
		Find(&materials).Error

	if err != nil {
		return nil, err
	}

	// Convert to announcements
	announcements := make([]DashboardAnnouncement, 0, len(materials))
	for _, m := range materials {
		content := m.Description
		if content == "" {
			content = "New material available"
		}
		announcements = append(announcements, DashboardAnnouncement{
			ID:      m.ID,
			Title:   m.Title,
			Content: content,
		})
	}

	return announcements, nil
}

// getCourseStats retrieves course statistics for a user
func (s *DashboardService) getCourseStats(userID uint) (DashboardStats, error) {
	stats := DashboardStats{
		NewMessages: 0, // Placeholder for future messaging feature
	}

	// Count active courses
	var activeCourses int64
	err := s.db.Model(&models.Enrollment{}).
		Where("user_id = ? AND status = ?", userID, models.EnrollmentStatusApproved).
		Count(&activeCourses).Error
	if err != nil {
		return stats, err
	}
	stats.ActiveCourses = int(activeCourses)

	// Count upcoming assignments
	var upcomingAssignments int64
	err = s.db.Model(&models.Assignment{}).
		Joins("JOIN enrollments ON enrollments.course_id = assignments.course_id").
		Where("enrollments.user_id = ? AND enrollments.status = ? AND assignments.due_date > ? AND assignments.is_published = ?",
			userID, models.EnrollmentStatusApproved, time.Now(), true).
		Count(&upcomingAssignments).Error
	if err != nil {
		return stats, err
	}
	stats.UpcomingAssignments = int(upcomingAssignments)

	return stats, nil
}
