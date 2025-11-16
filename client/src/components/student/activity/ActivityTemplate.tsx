import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import type { Activity } from "../../../store/activity/type";
import { titleCase, formatDate } from "../../../utils/format";
import Markdown from "react-markdown";

interface ActivityTemplateProps {
  activity: Activity;
  children?: React.ReactNode;
}

const ActivityTemplate: React.FC<ActivityTemplateProps> = ({ activity, children }) => {
  const creator = titleCase(activity.creator);
  const createdAt = formatDate(activity.createdAt);
  const description = `${creator} ${createdAt}`;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{activity.title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Markdown className="prose prose-invert max-w-none">{activity.description}</Markdown>
        {children}
      </CardContent>
    </Card>
  );
};

export default ActivityTemplate;
