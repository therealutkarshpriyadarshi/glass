import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import CreateAssignment from "./CreateAssignment";
import CreateMaterial from "./CreateMaterial";
import Quiz from "../quiz/Quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Create {component}</CardTitle>
        <Tabs
          value={component}
          onValueChange={(value) => setComponent(value as ComponentType)}
        >
          <TabsList>
            <TabsTrigger value="assignment">Assignment</TabsTrigger>
            <TabsTrigger value="material">Material</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {component === "assignment" && <CreateAssignment />}
        {component === "material" && <CreateMaterial />}
        {component === "quiz" && <Quiz />}
      </CardContent>
    </Card>
  );
};

export default CreateCourseComponent;
