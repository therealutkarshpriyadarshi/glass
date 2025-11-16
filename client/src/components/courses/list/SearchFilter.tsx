import React, { useState } from "react";
import { Input, Button, Drawer, Space, Select, Switch } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import styled from "styled-components";

const { Search } = Input;
const { Option } = Select;

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

  return (
    <>
      <SearchContainer>
        <StyledSearch
          placeholder="Search courses"
          onSearch={onSearch}
          enterButton={<SearchOutlined />}
        />
        <Button
          icon={<FilterOutlined />}
          onClick={() => setIsFilterVisible(true)}
        >
          Filters
        </Button>
      </SearchContainer>

      <Drawer
        title="Course Filters"
        placement="right"
        onClose={() => setIsFilterVisible(false)}
        open={isFilterVisible}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <h4>Category</h4>
            <Select
              style={{ width: "100%" }}
              value={filters.category}
              onChange={(value) => handleFilterChange({ category: value })}
            >
              <Option value="All">All Categories</Option>
              {categories.map((category) => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <h4>Difficulty</h4>
            <Select
              style={{ width: "100%" }}
              value={filters.difficulty}
              onChange={(value) => handleFilterChange({ difficulty: value })}
            >
              <Option value="All">All Difficulties</Option>
              <Option value="Easy">Easy</Option>
              <Option value="Medium">Medium</Option>
              <Option value="Hard">Hard</Option>
            </Select>
          </div>

          <div>
            <h4>Status</h4>
            <Switch
              checked={filters.isActive}
              onChange={(checked) => handleFilterChange({ isActive: checked })}
              checkedChildren="Active"
              unCheckedChildren="All"
            />
          </div>
        </Space>
      </Drawer>
    </>
  );
};

const SearchContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding-bottom: 26px;
  position: sticky;
  top: 0;
  z-index: 1000; // Ensure it stays on top of other elements
`;

const StyledSearch = styled(Search)`
  width: 60%;
  max-width: 600px;
`;
export default CourseSearchAndFilters;
