import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import DashboardHeader from "./Header";
import { setAuthToken } from "./api/server";

const Layout: React.FC = () => {
  // Initialize auth token from localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
