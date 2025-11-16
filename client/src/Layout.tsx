import React from "react";
import { Layout as AntLayout } from "antd";
import { Outlet } from "react-router-dom";
import DashboardHeader from "./Header";

const { Header, Content } = AntLayout;

const Layout: React.FC = () => {
  return (
    <AntLayout>
      <Header style={{ padding: 0, background: "#fff" }}>
        <DashboardHeader />
      </Header>
      <Content>
        <Outlet />
      </Content>
    </AntLayout>
  );
};

export default Layout;
