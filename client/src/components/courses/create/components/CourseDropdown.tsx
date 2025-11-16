import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CourseDropdownProps {
  onSelect: (value: string) => void;
}

const CourseDropdown: React.FC<CourseDropdownProps> = ({ onSelect }) => {
  return (
    <Select onValueChange={onSelect}>
      <SelectTrigger>
        <SelectValue placeholder="Select a course" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">Course 1</SelectItem>
        <SelectItem value="2">Course 2</SelectItem>
        <SelectItem value="3">Course 3</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default CourseDropdown;
