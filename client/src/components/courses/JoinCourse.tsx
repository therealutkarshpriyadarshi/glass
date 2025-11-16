import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { joinCourse, clearError } from "../../store/enrollments/slice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle } from "lucide-react";

interface JoinCourseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JoinCourse: React.FC<JoinCourseProps> = ({ open, onOpenChange }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.enrollments);
  const [invitationCode, setInvitationCode] = useState("");
  const [role, setRole] = useState<string>("student");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invitationCode.trim()) {
      return;
    }

    try {
      await dispatch(joinCourse({ code: invitationCode.toUpperCase(), role })).unwrap();
      setSuccess(true);
      // Reset after 2 seconds and close
      setTimeout(() => {
        setSuccess(false);
        setInvitationCode("");
        setRole("student");
        onOpenChange(false);
        dispatch(clearError());
      }, 2000);
    } catch (err) {
      // Error is handled by Redux
    }
  };

  const handleClose = () => {
    setInvitationCode("");
    setRole("student");
    setSuccess(false);
    dispatch(clearError());
    onOpenChange(false);
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Request Sent Successfully!
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <AlertDescription>
                Your enrollment request has been submitted. You will be notified once the instructor approves your request.
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Course</DialogTitle>
          <DialogDescription>
            Enter the invitation code provided by your instructor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="invitationCode">Invitation Code *</Label>
            <Input
              id="invitationCode"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
              placeholder="e.g., ABC12XYZ"
              maxLength={8}
              className="font-mono uppercase"
              required
              autoFocus
            />
            <p className="text-sm text-muted-foreground">
              Enter the 8-character code provided by your instructor
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Join as *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teaching Assistant</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Select your role in this course
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !invitationCode.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join Course"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinCourse;
