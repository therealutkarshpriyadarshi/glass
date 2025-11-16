import React from "react";
import { List, Avatar, Typography, Space } from "antd";
import { FileOutlined, CalendarOutlined } from "@ant-design/icons";
import type { AssignmentBasic } from "../../../store/assignments/type";
import "./style.css";
import styled from "styled-components";

const { Text } = Typography;

interface AssignmentOverviewProps {
  assignments: AssignmentBasic[];
}
/**
 * AssignmentOverview component displays a list of assignments.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {AssignmentBasic[]} props.assignments - An array of assignment objects to be displayed.
 * @returns {React.FC} A list of assignments.
 */
const AssignmentOverview: React.FC<AssignmentOverviewProps> = ({
  assignments,
}) => {
  return (
    <List
      itemLayout="horizontal"
      dataSource={assignments}
      renderItem={(assignment) => (
        <StyledListItem>
          <List.Item.Meta
            avatar={<AssignmentAvatar icon={<FileOutlined />} />}
            title={
              <AssignmentTitle level={4}>{assignment.title}</AssignmentTitle>
            }
            description={
              <Space direction="vertical" size="small">
                <Text type="secondary">
                  <CalendarOutlined /> Due: {assignment.dueDate}
                </Text>
                <Text>{assignment.description}</Text>
              </Space>
            }
          />
        </StyledListItem>
      )}
    />
  );
};

const StyledListItem = styled(List.Item)`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f9f9f9;
  }
`;

const AssignmentAvatar = styled(Avatar)`
  background-color: #1890ff;
`;

const AssignmentTitle = styled(Typography.Title)`
  margin-bottom: 0 !important;
`;

export default AssignmentOverview;
