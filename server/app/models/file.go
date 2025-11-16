package models

import "gorm.io/gorm"

type FileExtension string

const (
	FileExtensionPDF  FileExtension = "pdf"
	FileExtensionDOCX FileExtension = "docx"
	FileExtensionDOC  FileExtension = "doc"
	FileExtensionPPTX FileExtension = "pptx"
	FileExtensionPPT  FileExtension = "ppt"
	FileExtensionXLSX FileExtension = "xlsx"
	FileExtensionXLS  FileExtension = "xls"
	FileExtensionZIP  FileExtension = "zip"
	FileExtensionRAR  FileExtension = "rar"
	FileExtensionTXT  FileExtension = "txt"
	FileExtensionCSV  FileExtension = "csv"
	FileExtensionJSON FileExtension = "json"
	FileExtensionPNG  FileExtension = "png"
	FileExtensionJPG  FileExtension = "jpg"
	FileExtensionJPEG FileExtension = "jpeg"
)

func IsValidFileExtension(extension FileExtension) bool {
	switch extension {
	case FileExtensionPDF:
		return true
	case FileExtensionDOCX:
		return true
	case FileExtensionDOC:
		return true
	case FileExtensionPPTX:
		return true
	case FileExtensionPPT:
		return true
	case FileExtensionXLSX:
		return true
	case FileExtensionXLS:
		return true
	case FileExtensionZIP:
		return true
	case FileExtensionRAR:
		return true
	case FileExtensionTXT:
		return true
	case FileExtensionCSV:
		return true
	case FileExtensionJSON:
		return true
	case FileExtensionPNG:
		return true
	case FileExtensionJPG:
		return true
	case FileExtensionJPEG:
		return true
	default:
		return false
	}
}

type BaseFile struct {
	gorm.Model
	FileName     string        `json:"fileName" gorm:"not null"`
	FileUrl      string        `json:"fileUrl" gorm:"not null"`
	Extension    FileExtension `json:"extension" gorm:"not null"`
	UserFileName string        `json:"userFileName" gorm:"not null"`
}

type AssignmentFile struct {
	BaseFile
	AssignmentId uint       `json:"assignmentId" gorm:"not null"`
	Assignment   Assignment `json:"assignment" gorm:"foreignKey:AssignmentId"`
}

func (AssignmentFile) TableName() string {
	return "assignment_files"
}

type MaterialFile struct {
	BaseFile
	MaterialId uint     `json:"materialId" gorm:"not null"`
	Material   Material `json:"material" gorm:"foreignKey:MaterialId"`
}

func (MaterialFile) TableName() string {
	return "material_files"
}

type SubmissionFile struct {
	BaseFile
	SubmissionId uint       `json:"submissionId" gorm:"not null"`
	Submission   Submission `json:"submission" gorm:"foreignKey:SubmissionId"`
}

func (SubmissionFile) TableName() string {
	return "submission_files"
}
