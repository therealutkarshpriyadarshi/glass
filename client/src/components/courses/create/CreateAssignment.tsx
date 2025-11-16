import React, { useState } from "react";
import Description from "./components/Description";
import FileUpload from "./components/FileUpload";
import CourseDropdown from "./components/CourseDropdown";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";

/**
 * CreateAssignment component for creating a new assignment
 *
 * This component renders a form for creating a new assignment. It includes
 * fields for the assignment title, description, date range, and file uploads.
 *
 * @component
 * @returns {JSX.Element} Rendered CreateAssignment component
 */
const CreateAssignment: React.FC = (): JSX.Element => {
  const [title, setTitle] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [course, setCourse] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title) newErrors.title = "Please input the title!";
    if (!markdown) newErrors.description = "Please input the description!";
    if (!course) newErrors.course = "Please select a course!";
    if (!startDate || !endDate)
      newErrors.dateRange = "Please select the date/time range!";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const values = {
        title,
        description: markdown,
        course,
        dateRange: [startDate, endDate],
        files,
      };
      console.log("Form values:", values);
      // Handle form submission
    }
  };

  const handleUpload = (uploadedFiles: File[]) => {
    console.log("Uploading file:", uploadedFiles);
    setFiles(uploadedFiles);
  };

  const handleCourseSelect = (value: string) => {
    console.log("Selected course:", value);
    setCourse(value);
    setErrors((prev) => ({ ...prev, course: "" }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 space-y-4">
          <div>
            <Label htmlFor="title">Assignment Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((prev) => ({ ...prev, title: "" }));
              }}
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <Label>Assignment Description</Label>
            <Description
              markdown={markdown}
              onChange={(value) => {
                setMarkdown(value);
                setErrors((prev) => ({ ...prev, description: "" }));
              }}
              editorRef={null}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">
                {errors.description}
              </p>
            )}
          </div>
        </div>

        <div className="md:col-span-1 space-y-4">
          <div>
            <Label>Course</Label>
            <CourseDropdown onSelect={handleCourseSelect} />
            {errors.course && (
              <p className="text-sm text-destructive mt-1">{errors.course}</p>
            )}
          </div>

          <div>
            <Label>Start Date/Time</Label>
            <DatePicker
              value={startDate}
              onChange={(date: Date | undefined) => {
                setStartDate(date);
                setErrors((prev) => ({ ...prev, dateRange: "" }));
              }}
            />
          </div>

          <div>
            <Label>End Date/Time</Label>
            <DatePicker
              value={endDate}
              onChange={(date: Date | undefined) => {
                setEndDate(date);
                setErrors((prev) => ({ ...prev, dateRange: "" }));
              }}
            />
            {errors.dateRange && (
              <p className="text-sm text-destructive mt-1">
                {errors.dateRange}
              </p>
            )}
          </div>

          <div>
            <Label>Add Files</Label>
            <FileUpload onFilesSelected={handleUpload} />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button type="submit">Create Assignment</Button>
      </div>
    </form>
  );
};

export default CreateAssignment;
