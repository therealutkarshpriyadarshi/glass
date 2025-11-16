import React from "react";
import { Dropdown, MenuProps, Button } from "antd";
import {
  SoundOutlined,
  FileOutlined,
  EditOutlined,
  PlusOutlined,
  CarryOutFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

/**
 * AddDropDown component provides a dropdown menu for creating various course-related items.
 *
 * @component
 * @returns {React.FC} A dropdown menu with options to create announcements, assignments, materials, and quizzes.
 */
const AddDropDown: React.FC = () => {
  const navigate = useNavigate();

  /**
   * Handles the click event on a menu item and navigates to the create page.
   *
   * @param {string} key - The key of the clicked menu item.
   */
  const handleMenuClick = (key: string) => {
    let compType: string;
    switch (key) {
      case "1":
        compType = "announcement";
        break;
      case "2":
        compType = "assignment";
        break;
      case "3":
        compType = "material";
        break;
      case "4":
        compType = "quiz";
        break;
      default:
        compType = "course";
    }
    navigate("/courses/create", {
      state: {
        compType: compType,
      },
    });
  };

  /**
   * Menu items for the dropdown.
   *
   * @type {MenuProps["items"]}
   */
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: "Announcement",
      icon: <SoundOutlined />,
      onClick: () => handleMenuClick("1"),
    },
    {
      key: "2",
      label: "Assignment",
      icon: <CarryOutFilled />,
      onClick: () => handleMenuClick("2"),
    },
    {
      key: "3",
      label: "Material",
      icon: <FileOutlined />,
      onClick: () => handleMenuClick("3"),
    },
    {
      key: "4",
      label: "Quiz",
      icon: <EditOutlined />,
      onClick: () => handleMenuClick("4"),
    },
  ];

  return (
    <Dropdown menu={{ items }}>
      <Button icon={<PlusOutlined />} type="primary">
        Create Something 😊
      </Button>
    </Dropdown>
  );
};

export default AddDropDown;
