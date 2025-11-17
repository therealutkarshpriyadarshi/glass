import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createMaterial } from "@/store/materials/slice";
import { toast } from "sonner";
import Description from "./components/Description";
import FileUpload from "./components/FileUpload";
import CourseDropdown from "./components/CourseDropdown";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

/**
 * CreateMaterial component for creating new course material
 *
 * This component renders a form for creating new course material. It includes
 * fields for the material title, description, and file uploads.
 *
 * @component
 * @returns {JSX.Element} Rendered CreateMaterial component
 */
const CreateMaterial: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, uploadProgress } = useAppSelector((state) => state.materials);

  const [title, setTitle] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [course, setCourse] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title) newErrors.title = "Please input the title!";
    if (!markdown) newErrors.description = "Please input the description!";
    if (!course) newErrors.course = "Please select a course!";
    if (files.length === 0) newErrors.files = "Please upload at least one file!";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await dispatch(
          createMaterial({
            courseId: course,
            title,
            description: markdown,
            files,
          })
        ).unwrap();

        toast.success("Material created successfully!");

        // Reset form
        setTitle("");
        setMarkdown("");
        setFiles([]);

        // Navigate back to course overview
        navigate(`/courses/${course}`);
      } catch (error: any) {
        toast.error(error || "Failed to create material");
      }
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
            <Label htmlFor="title">Material Title</Label>
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
            <Label>Material Description</Label>
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
            <Label>Add Files</Label>
            <FileUpload onFilesSelected={handleUpload} />
            {errors.files && (
              <p className="text-sm text-destructive mt-1">{errors.files}</p>
            )}
            {files.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {files.length} file(s) selected
              </p>
            )}
          </div>
        </div>
      </div>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-4">
          <Label>Upload Progress</Label>
          <Progress value={uploadProgress} className="mt-2" />
          <p className="text-sm text-muted-foreground mt-1">
            {uploadProgress}% uploaded
          </p>
        </div>
      )}

      <div className="mt-6">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Material"}
        </Button>
      </div>
    </form>
  );
};

export default CreateMaterial;
