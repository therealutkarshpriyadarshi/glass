import React from "react";
import { Outlet } from "react-router-dom";
import DashboardHeader from "./Header";

const Layout: React.FC = () => {
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
