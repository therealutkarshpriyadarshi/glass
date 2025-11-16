package models

import (
	"time"

	"gorm.io/gorm"
)

type Quiz struct {
	gorm.Model
	Title            string     `json:"title" gorm:"not null"`
	Description      string     `json:"description" gorm:"type:text"`
	CourseID         uint       `json:"courseId" gorm:"not null"`
	Course           Course     `json:"-" gorm:"foreignkey:CourseID"`
	StartTime        time.Time  `json:"startTime" gorm:"not null"`
	EndTime          time.Time  `json:"endTime" gorm:"not null"`
	Duration         int        `json:"duration" gorm:"not null"` // In minutes
	ShuffleQuestions bool       `json:"shuffleQuestions" gorm:"default:false"`
	ShowResults      bool       `json:"showResults" gorm:"default:true"`
	Questions        []Question `json:"questions" gorm:"foreignKey:QuizID"`
	CreatorID        uint       `json:"creatorId" gorm:"not null"`
	Creator          User       `json:"-" gorm:"foreignkey:CreatorID"`
}

type QuestionType int

const (
	SingleCorrect QuestionType = iota
	MultiCorrect
)

type Question struct {
	gorm.Model
	QuizID      uint         `json:"quizId" gorm:"not null"`
	Quiz        Quiz         `json:"-" gorm:"foreignkey:QuizID"`
	Title       string       `json:"title" gorm:"not null"`
	Description string       `json:"description"`
	Type        QuestionType `json:"type" gorm:"not null"`
	Points      int          `json:"points" gorm:"not null"`
	Options     []Option     `json:"options" gorm:"foreignKey:QuestionID"`
}

type Option struct {
	gorm.Model
	QuestionID uint     `json:"questionId" gorm:"not null"`
	Question   Question `json:"-" gorm:"foreignkey:QuestionID"`
	Text       string   `json:"text" gorm:"not null"`
	IsCorrect  bool     `json:"isCorrect" gorm:"not null"`
}

type QuizSubmission struct {
	gorm.Model
	QuizID    uint      `json:"quizId" gorm:"not null"`
	Quiz      Quiz      `json:"-" gorm:"foreignkey:QuizID"`
	UserID    uint      `json:"userId" gorm:"not null"`
	User      User      `json:"-" gorm:"foreignkey:UserID"`
	StartTime time.Time `json:"startTime" gorm:"not null"`
	EndTime   time.Time `json:"endTime"`
	Score     float64   `json:"score"`
	Answers   []Answer  `json:"answers" gorm:"foreignKey:SubmissionID"`
}

type Answer struct {
	gorm.Model
	SubmissionID        uint           `json:"submissionId" gorm:"not null"`
	Submission          QuizSubmission `json:"-" gorm:"foreignkey:SubmissionID"`
	QuestionID          uint           `json:"questionId" gorm:"not null"`
	Question            Question       `json:"-" gorm:"foreignkey:QuestionID"`
	SelectedOptions     []uint         `json:"selectedOptions" gorm:"-"` // This will be stored as JSON in the database
	SelectedOptionsJSON string         `json:"-" gorm:"column:selected_options"`
}
