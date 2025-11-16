import React from "react";
import type { Mentor, Student } from "../../../store/people/type";
import { Card, List, Avatar, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
interface TemplateProps {
  title: string;
  data: Mentor[] | Student[];
}

const Template: React.FC<TemplateProps> = ({ title, data }) => {
  return (
    <Card
      title={title}
      extra={
        <Button type="primary" icon={<PlusOutlined />}>
          Add
        </Button>
      }
    >
      <List
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={item.profilePictureUrl} />}
              title={item.name}
              description={item.email}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default Template;
