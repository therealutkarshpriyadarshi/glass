import React from "react";
import { Card } from "antd";
import type { Activity } from "../../../store/activity/type";
import { titleCase, formatDate } from "../../../utils/format";
import Markdown from "react-markdown";

interface ActivityTemplateProps {
  activity: Activity;
  children?: React.ReactNode;
}

const ActivityTemplate: React.FC<ActivityTemplateProps> = ({ activity }) => {
  const creator = titleCase(activity.creator);
  const createdAt = formatDate(activity.createdAt);
  const description = `${creator} ${createdAt}`;
  return (
    <Card>
      <Card.Meta title={activity.title} description={description} />
      <Markdown>{activity.description}</Markdown>
    </Card>
  );
};

export default ActivityTemplate;
