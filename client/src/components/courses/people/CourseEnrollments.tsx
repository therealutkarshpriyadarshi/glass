import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchCourseStudents,
  fetchPendingEnrollments,
  approveEnrollment,
  rejectEnrollment,
} from "../../../store/enrollments/slice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Check, X, Users, Clock } from "lucide-react";

const CourseEnrollments: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { enrollments, pendingEnrollments, loading, error } = useAppSelector(
    (state) => state.enrollments
  );

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseStudents(parseInt(courseId)));
      dispatch(fetchPendingEnrollments(parseInt(courseId)));
    }
  }, [dispatch, courseId]);

  const handleApprove = async (enrollmentId: number) => {
    try {
      await dispatch(approveEnrollment(enrollmentId)).unwrap();
      // Refresh the lists
      if (courseId) {
        dispatch(fetchCourseStudents(parseInt(courseId)));
      }
    } catch (err) {
      console.error("Failed to approve enrollment:", err);
    }
  };

  const handleReject = async (enrollmentId: number) => {
    try {
      await dispatch(rejectEnrollment(enrollmentId)).unwrap();
    } catch (err) {
      console.error("Failed to reject enrollment:", err);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "?";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "teacher":
        return "bg-primary/10 text-primary border-primary/20";
      case "admin":
        return "bg-secondary/10 text-secondary border-secondary/20";
      default:
        return "bg-accent/10 text-accent border-accent/20";
    }
  };

  if (loading && enrollments.length === 0 && pendingEnrollments.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="enrolled" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="enrolled" className="gap-2">
            <Users className="h-4 w-4" />
            Enrolled ({enrollments.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingEnrollments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Members</CardTitle>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No enrolled members yet
                </p>
              ) : (
                <div className="space-y-3">
                  {enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors border border-border"
                    >
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(
                            enrollment.user?.firstName,
                            enrollment.user?.lastName
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">
                          {enrollment.user?.firstName} {enrollment.user?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {enrollment.user?.email}
                        </p>
                      </div>
                      <Badge className={getRoleBadgeColor(enrollment.role)}>
                        {enrollment.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingEnrollments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No pending requests
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingEnrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card"
                    >
                      <Avatar>
                        <AvatarFallback className="bg-warning/10 text-warning">
                          {getInitials(
                            enrollment.user?.firstName,
                            enrollment.user?.lastName
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">
                          {enrollment.user?.firstName} {enrollment.user?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {enrollment.user?.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Requesting to join as: {enrollment.role}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 text-[hsl(var(--success))] border-[hsl(var(--success))]/20 hover:bg-[hsl(var(--success))]/10"
                          onClick={() => handleApprove(enrollment.id)}
                          disabled={loading}
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10"
                          onClick={() => handleReject(enrollment.id)}
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseEnrollments;
