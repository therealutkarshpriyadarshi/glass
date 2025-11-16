import React from "react";
import { Select } from "antd";

const { Option } = Select;

interface CourseDropdownProps {
  onSelect: (value: string) => void;
}

const CourseDropdown: React.FC<CourseDropdownProps> = ({ onSelect }) => {
  return (
    <Select
      placeholder="Select a course"
      onChange={onSelect}
      allowClear
      autoFocus
      defaultOpen
    >
      <Option value="1">Course 1</Option>
      <Option value="2">Course 2</Option>
      <Option value="3">Course 3</Option>
    </Select>
  );
};

export default CourseDropdown;
