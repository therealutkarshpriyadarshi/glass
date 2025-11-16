import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Space, Tag } from "antd";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  BookOutlined,
  CalendarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { Course } from "../../../store/courses/types";
import { fetchUserCourses } from "../../../store/courses/slice";
import CourseSearchAndFilters, { FilterState } from "./SearchFilter";

const { Title, Text } = Typography;
const { Meta } = Card;

/**
 * UserCourses component displays a list of courses for the user.
 * It fetches courses from the Redux store and renders them in a grid layout.
 */
const UserCourses: React.FC = () => {
  const dispatch = useAppDispatch();
  const { courses, loading, error } = useAppSelector((state) => state.courses);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const not = false;
    if (not) dispatch(fetchUserCourses());
  }, [dispatch]);

  useEffect(() => {
    setFilteredCourses(courses);
  }, [courses]);

  const handleSearch = (value: string) => {
    setSearch(value);
    filterCourses(value, null);
  };

  const handleFilterChange = (filters: FilterState) =>
    filterCourses(search, filters);

  const filterCourses = (search: string, filters: FilterState | null) => {
    let filtered = courses.filter((course) =>
      course.name.toLowerCase().includes(search.toLowerCase())
    );

    if (filters != null) {
      if (filters.category && filters.category !== "All") {
        filtered = filtered.filter(
          (course) => course.category === filters.category
        );
      }

      filtered = filtered.filter(
        (course) => course.difficulty === filters.difficulty
      );

      if (filters.isActive)
        filtered = filtered.filter((course) => course.isActive);
    }

    setFilteredCourses(filtered);
  };

  const categories = Array.from(
    new Set(courses.map((course) => course.category))
  );

  if (loading) return <div>Loading courses...</div>;

  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <CourseSearchAndFilters
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        categories={categories}
      />
      <Row gutter={[16, 16]}>
        {filteredCourses.map((course: Course) => (
          <Col xs={24} sm={24} md={12} lg={12} xl={12} key={course.id}>
            <StyledCard
              cover={<CoverImage svgContent={generateDarkSVG()} />}
              style={{
                cursor: "pointer",
              }}
            >
              <Meta
                title={<CourseTitle level={4}>{course.name}</CourseTitle>}
                description={
                  <Space direction="vertical" size="small">
                    <Text type="secondary">{course.description}</Text>
                    <Space>
                      <Tag icon={<BookOutlined />} color="blue">
                        {course.category}
                      </Tag>
                      <Tag icon={<CalendarOutlined />} color="green">
                        {course.startDate} - {course.endDate}
                      </Tag>
                      <Tag icon={<TeamOutlined />} color="orange">
                        {course.maxStudents} students max
                      </Tag>
                    </Space>
                    <Text>Difficulty: {course.difficulty}</Text>
                    <Text>
                      Status: {course.isActive ? "Active" : "Inactive"}
                    </Text>
                  </Space>
                }
              />
            </StyledCard>
          </Col>
        ))}
      </Row>
    </div>
  );
};

const StyledCard = styled(Card)`
  margin-bottom: 16px;
  transition: all 0.3s;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
  }
`;

const CourseTitle = styled(Title)`
  margin-bottom: 0 !important;
`;

const CoverImage = styled.div<{ svgContent: string }>`
  height: 200px;
  background-image: url("data:image/svg+xml,${(props) =>
    encodeURIComponent(props.svgContent)}");
  background-size: cover;
  background-position: center;
  border-radius: 8px 8px 0 0;
`;

/**
 * Generates a random dark-themed SVG for course card backgrounds.
 * @returns {string} An SVG string with random shapes and colors.
 */
const generateDarkSVG = () => {
  /**
   * Generates a random HSL color.
   * @param {number} saturation - The saturation percentage.
   * @param {number} lightness - The lightness percentage.
   * @returns {string} An HSL color string.
   */
  const getRandomColor = (saturation: number, lightness: number): string => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  /**
   * Generates a random SVG shape.
   * @returns {string} An SVG shape element as a string.
   */
  const getRandomShape = (): string => {
    const shapes = [
      `<circle cx="${50 + Math.random() * 20 - 10}" cy="${
        50 + Math.random() * 20 - 10
      }" r="${20 + Math.random() * 20}" />`,
      `<rect x="${10 + Math.random() * 20}" y="${
        10 + Math.random() * 20
      }" width="${60 + Math.random() * 20}" height="${
        60 + Math.random() * 20
      }" />`,
      `<polygon points="${50 + Math.random() * 20 - 10},${
        10 + Math.random() * 10
      } ${90 + Math.random() * 10},${90 + Math.random() * 10} ${
        10 + Math.random() * 10
      },${90 + Math.random() * 10}" />`,
    ];
    return shapes[Math.floor(Math.random() * shapes.length)];
  };

  const bgColor = getRandomColor(30, 15); // Dark background
  const shapeColor = getRandomColor(70, 60); // Brighter shape color

  const shapes = Array(5)
    .fill(null)
    .map(
      () =>
        `<g fill="${shapeColor}" opacity="${0.1 + Math.random() * 0.2}">
      ${getRandomShape()}
    </g>`
    )
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="${bgColor}" />
      ${shapes}
    </svg>
  `;
};

export default UserCourses;
