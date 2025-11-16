import React, { useEffect } from "react";
import { BookOpen, Calendar, MessageSquare, Bell } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchDashboardData } from "../../store/dashboard/slice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    upcomingAssignments,
    recentAnnouncements,
    courseStats,
    isLoading,
    error,
  } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6 max-w-7xl mx-auto flex justify-center items-center min-h-screen">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-4">Error</h2>
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-foreground mb-6">Dashboard</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          {/* Active Courses Stat */}
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-2">
                <BookOpen className="h-8 w-8 text-primary" />
                <p className="text-sm text-muted-foreground">Active Courses</p>
                <p className="text-3xl font-bold text-foreground">
                  {courseStats.activeCourses}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Assignments Stat */}
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-2">
                <Calendar className="h-8 w-8 text-green-500" />
                <p className="text-sm text-muted-foreground">
                  Upcoming Assignments
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {courseStats.upcomingAssignments}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* New Messages Stat */}
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-2">
                <MessageSquare className="h-8 w-8 text-yellow-500" />
                <p className="text-sm text-muted-foreground">New Messages</p>
                <p className="text-3xl font-bold text-foreground">
                  {courseStats.newMessages}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Assignments List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Upcoming Assignments</CardTitle>
              <a
                href="#"
                className="text-sm text-primary hover:underline"
              >
                View All
              </a>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAssignments.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 flex items-center justify-center bg-primary">
                      <Calendar className="h-5 w-5 text-primary-foreground" />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      {item.title && (
                        <a
                          href="#"
                          className="font-medium text-foreground hover:text-primary"
                        >
                          {item.title}
                        </a>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Due: {item.dueDate}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Announcements List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Recent Announcements</CardTitle>
              <a
                href="#"
                className="text-sm text-primary hover:underline"
              >
                View All
              </a>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAnnouncements.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 flex items-center justify-center bg-green-500">
                      <Bell className="h-5 w-5 text-white" />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <a
                        href="#"
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {item.title}
                      </a>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.content.length > 50
                          ? `${item.content.substring(0, 50)}...`
                          : item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
