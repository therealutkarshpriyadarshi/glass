import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { BookOpen, Calendar, Users } from "lucide-react";
import type { Course } from "../../../store/courses/types";
import { fetchUserCourses } from "../../../store/courses/slice";
import CourseSearchAndFilters, { FilterState } from "./SearchFilter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    dispatch(fetchUserCourses());
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

  if (loading) return <div className="text-foreground">Loading courses...</div>;

  if (error) return <div className="text-destructive">Error: {error}</div>;

  return (
    <div>
      <CourseSearchAndFilters
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        categories={categories}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCourses.map((course: Course) => (
          <Card
            key={course.id}
            className="mb-4 transition-all duration-300 rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer border-border"
          >
            <div
              className="h-[200px] bg-cover bg-center rounded-t-xl"
              style={{
                backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
                  generateDarkSVG()
                )}")`,
              }}
            />
            <CardContent className="p-6">
              <h4 className="text-xl font-semibold mb-4 text-foreground">
                {course.name}
              </h4>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {course.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-blue-500/10 text-blue-400 border-blue-500/20"
                  >
                    <BookOpen className="h-3 w-3" />
                    {course.category}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-green-500/10 text-green-400 border-green-500/20"
                  >
                    <Calendar className="h-3 w-3" />
                    {course.startDate} - {course.endDate}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-orange-500/10 text-orange-400 border-orange-500/20"
                  >
                    <Users className="h-3 w-3" />
                    {course.maxStudents} students max
                  </Badge>
                </div>
                <p className="text-sm text-foreground">
                  Difficulty: {course.difficulty}
                </p>
                <p className="text-sm text-foreground">
                  Status: {course.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

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
