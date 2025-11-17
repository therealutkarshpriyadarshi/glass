import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAssignmentById } from "@/store/assignments/api";
import { createSubmission } from "@/store/submissions/api";
import { ArrowLeft, Upload, X, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const SubmitAssignment: React.FC = () => {
  const { courseId, assignmentId } = useParams<{
    courseId: string;
    assignmentId: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { currentAssignment: assignment, loading: assignmentLoading } =
    useAppSelector((state) => state.assignments);
  const { loading: submissionLoading } = useAppSelector(
    (state) => state.submissions
  );

  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (assignmentId) {
      dispatch(fetchAssignmentById(parseInt(assignmentId)));
    }
  }, [assignmentId, dispatch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      // Validate file extensions if specified in assignment
      if (assignment?.allowedFileExtensions) {
        const allowedExtensions = assignment.allowedFileExtensions.split(",").map(ext => ext.trim().toLowerCase());
        const invalidFiles = selectedFiles.filter(file => {
          const ext = file.name.split(".").pop()?.toLowerCase();
          return ext && !allowedExtensions.includes(ext);
        });

        if (invalidFiles.length > 0) {
          alert(`Invalid file type(s). Allowed extensions: ${assignment.allowedFileExtensions}`);
          return;
        }
      }

      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      alert("Please select at least one file to submit");
      return;
    }

    if (!assignmentId) return;

    // Simulate upload progress
    setUploadProgress(30);

    try {
      await dispatch(
        createSubmission({
          assignmentId: parseInt(assignmentId),
          files,
        })
      ).unwrap();

      setUploadProgress(100);

      // Navigate back to assignment detail page
      setTimeout(() => {
        navigate(`/courses/${courseId}/assignments/${assignmentId}`);
      }, 500);
    } catch (error) {
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  if (assignmentLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-muted-foreground">Loading assignment...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-lg text-muted-foreground">Assignment not found</div>
        <Button onClick={() => navigate(`/courses/${courseId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>
      </div>
    );
  }

  const isOverdue = new Date(assignment.dueDate) < new Date();

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/courses/${courseId}/assignments/${assignmentId}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assignment
        </Button>

        <h1 className="text-3xl font-bold mb-2">Submit: {assignment.title}</h1>
        <p className="text-muted-foreground">
          Due: {new Date(assignment.dueDate).toLocaleString()}
        </p>
        {isOverdue && (
          <p className="text-destructive font-semibold mt-2">
            ⚠️ This assignment is overdue. Late submissions may not be accepted.
          </p>
        )}
      </div>

      {/* Submission Form */}
      <Card>
        <CardHeader>
          <CardTitle>Your Submission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div>
            <Label htmlFor="file-upload">Upload Files</Label>
            {assignment.allowedFileExtensions && (
              <p className="text-sm text-muted-foreground mb-2">
                Allowed file types: {assignment.allowedFileExtensions}
              </p>
            )}
            <div className="mt-2">
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose Files
              </Button>
            </div>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div>
              <Label>Selected Files ({files.length})</Label>
              <div className="mt-2 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-border rounded-md"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div>
              <Label>Uploading...</Label>
              <Progress value={uploadProgress} className="mt-2" />
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={files.length === 0 || submissionLoading}
            className="w-full"
          >
            {submissionLoading ? "Submitting..." : "Submit Assignment"}
          </Button>

          {/* Warning */}
          <p className="text-sm text-muted-foreground text-center">
            Make sure all files are correct before submitting. You may be able to
            resubmit if allowed by your instructor.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmitAssignment;
