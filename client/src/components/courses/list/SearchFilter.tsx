import React, { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CourseSearchAndFiltersProps {
  onSearch: (value: string) => void;
  onFilterChange: (filters: FilterState) => void;
  categories: string[];
}

export interface FilterState {
  category: string;
  difficulty: string;
  isActive: boolean;
}

/**
 * CourseSearchAndFilters component provides a search input and filter options for courses.
 *
 * @component
 * @param {Object} props - The component props
 * @param {function} props.onSearch - Callback function triggered when a search is performed
 * @param {function} props.onFilterChange - Callback function triggered when filters are changed
 * @param {string[]} props.categories - Array of available course categories
 *
 * @returns {React.FC} A React component with search and filter functionality
 */
const CourseSearchAndFilters: React.FC<CourseSearchAndFiltersProps> = ({
  onSearch,
  onFilterChange,
  categories,
}) => {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    category: "All",
    difficulty: "All",
    isActive: true,
  });

  /**
   * Handles changes in filter options
   *
   * @param {Partial<FilterState>} newFilters - The updated filter options
   */
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleSearch = () => {
    onSearch(searchValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex justify-center items-center gap-4 pb-6 sticky top-0 z-50 bg-background pt-4">
      <div className="relative w-[60%] max-w-[600px]">
        <Input
          type="text"
          placeholder="Search courses"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pr-10"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full"
          onClick={handleSearch}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <Sheet open={isFilterVisible} onOpenChange={setIsFilterVisible}>
        <SheetTrigger asChild>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Course Filters</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange({ category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={filters.difficulty}
                onValueChange={(value) => handleFilterChange({ difficulty: value })}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Difficulties</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="status" className="flex-1">
                Show Active Only
              </Label>
              <Switch
                id="status"
                checked={filters.isActive}
                onCheckedChange={(checked) => handleFilterChange({ isActive: checked })}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CourseSearchAndFilters;
