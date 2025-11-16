import React from "react";
import {
  Volume2,
  FileText,
  Edit,
  Plus,
  CheckSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
   * @param {string} compType - The type of component to create.
   */
  const handleMenuClick = (compType: string) => {
    navigate("/courses/create", {
      state: {
        compType: compType,
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Something
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleMenuClick("announcement")}>
          <Volume2 className="mr-2 h-4 w-4" />
          Announcement
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleMenuClick("assignment")}>
          <CheckSquare className="mr-2 h-4 w-4" />
          Assignment
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleMenuClick("material")}>
          <FileText className="mr-2 h-4 w-4" />
          Material
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleMenuClick("quiz")}>
          <Edit className="mr-2 h-4 w-4" />
          Quiz
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AddDropDown;
