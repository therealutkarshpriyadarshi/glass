import React from "react";
import type { Mentor } from "../../../store/people/type";
import Template from "./Template";

interface CourseMentorsProps {
  mentors: Mentor[];
}

const CourseMentors: React.FC<CourseMentorsProps> = ({ mentors }) => {
  return <Template title="Mentors" data={mentors} />;
};

export default CourseMentors;
