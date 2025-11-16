import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../store/hooks";
import { createCourse } from "../../../store/courses/slice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Check, Loader2 } from "lucide-react";

interface CourseFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  difficulty: string;
  category: string;
  isActive: boolean;
}

const CreateCourse: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CourseFormData>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    maxStudents: 30,
    difficulty: "beginner",
    category: "",
    isActive: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxStudents" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await dispatch(createCourse(formData)).unwrap();
      setInvitationCode(result.invitation_code);
    } catch (err: any) {
      setError(err.message || "Failed to create course");
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (invitationCode) {
      navigator.clipboard.writeText(invitationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoToCourse = () => {
    navigate("/courses");
  };

  if (invitationCode) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Created Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Your course has been created. Share this invitation code with students:
              </AlertDescription>
            </Alert>

            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <code className="text-2xl font-mono font-bold flex-1 text-center">
                {invitationCode}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyCode}
                className="flex-shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setInvitationCode(null)}>
                Create Another Course
              </Button>
              <Button onClick={handleGoToCourse}>
                Go to My Courses
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Course</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Course Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Introduction to Computer Science"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the course"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Computer Science, Mathematics, Physics"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level *</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => handleSelectChange("difficulty", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxStudents">Max Students *</Label>
                <Input
                  id="maxStudents"
                  name="maxStudents"
                  type="number"
                  value={formData.maxStudents}
                  onChange={handleChange}
                  min="1"
                  max="1000"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Course"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCourse;
