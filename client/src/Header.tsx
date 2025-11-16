import React from "react";
import { Layout, Avatar, Dropdown, Badge, MenuProps } from "antd";
import {
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { logout } from "./store/auth/authSlice";

const { Header } = Layout;

const StyledHeader = styled(Header)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 1;
  width: 100%;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
`;

const RightMenu = styled.div`
  display: flex;
  align-items: center;
`;

const IconButton = styled.span`
  padding: 0 12px;
  cursor: pointer;
  font-size: 20px;
  color: #8c8c8c;
  transition: color 0.3s;

  &:hover {
    color: #1890ff;
  }
`;

const StyledAvatar = styled(Avatar)`
  cursor: pointer;
  background-color: #1890ff;
`;

/**
 * DashboardHeader component
 *
 * This component represents the header of the dashboard, including the logo,
 * notification bell, and user menu dropdown.
 */
const DashboardHeader: React.FC = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  const userMenu: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  return (
    <StyledHeader>
      <Logo>ClassConnect</Logo>
      <RightMenu>
        <Badge count={5} offset={[-5, 5]}>
          <IconButton>
            <BellOutlined />
          </IconButton>
        </Badge>
        <Dropdown menu={{ items: userMenu }} trigger={["click"]}>
          <IconButton>
            <StyledAvatar icon={<UserOutlined />} />
          </IconButton>
        </Dropdown>
      </RightMenu>
    </StyledHeader>
  );
};

export default DashboardHeader;
