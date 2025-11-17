import React, { useState } from "react";
import { User, Settings, LogOut, Plus, UserPlus } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "./store/auth/authSlice";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import JoinCourse from "./components/courses/JoinCourse";
import NotificationDropdown from "./components/notifications/NotificationDropdown";

/**
 * DashboardHeader component
 *
 * This component represents the header of the dashboard, including the logo,
 * notification bell, and user menu dropdown.
 */
const DashboardHeader: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleCreateCourse = () => {
    navigate("/courses/new");
  };

  const handleJoinCourse = () => {
    setJoinDialogOpen(true);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="text-2xl font-bold text-primary">ClassConnect</div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleJoinCourse}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Join Course
          </Button>
          <Button
            size="sm"
            onClick={handleCreateCourse}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Course
          </Button>

          <NotificationDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer bg-primary hover:opacity-90 transition-opacity">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <JoinCourse open={joinDialogOpen} onOpenChange={setJoinDialogOpen} />
    </header>
  );
};

export default DashboardHeader;
