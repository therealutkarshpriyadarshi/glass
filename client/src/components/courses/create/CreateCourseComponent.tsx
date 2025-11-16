import React, { useState } from "react";
import { Card, Segmented } from "antd";
import { useLocation } from "react-router-dom";
import CreateAssignment from "./CreateAssignment";
import CreateMaterial from "./CreateMaterial";
import Quiz from "../quiz/Quiz";

type ComponentType = "course" | "quiz" | "material" | "assignment";

/**
 * CreateCourseComponent is a React functional component that allows users to create
 * different types of course content such as assignments, materials, and quizzes.
 *
 * @component
 * @returns {JSX.Element} Rendered CreateCourseComponent
 */
const CreateCourseComponent: React.FC = () => {
  const location = useLocation();
  let componentType = "assignment" as ComponentType;
  if (location.state) componentType = location.state.compType as ComponentType;
  const [component, setComponent] = useState<ComponentType>(componentType);

  /**
   * Array of segment options for the Segmented component
   * @type {Array<{label: string, value: string, component?: JSX.Element}>}
   */
  const segments = [
    {
      label: "Assignment",
      value: "assignment",
      component: <CreateAssignment />,
    },
    { label: "Material", value: "material", component: <CreateMaterial /> },
    { label: "Quiz", value: "quiz" },
  ];

  return (
    <Card
      title={`Create ${component} 😊`}
      bordered={false}
      activeTabKey={component}
      onTabChange={(key) => setComponent(key as ComponentType)}
      extra={
        <Segmented
          options={segments}
          onChange={(key) => setComponent(key as ComponentType)}
          value={component}
        />
      }
    >
      {component === "assignment" ? <CreateAssignment /> : null}
      {component === "material" ? <CreateMaterial /> : null}
      {component === "quiz" ? <Quiz /> : null}
    </Card>
  );
};

export default CreateCourseComponent;
