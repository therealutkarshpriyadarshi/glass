import React, { useEffect } from "react";
import {
  Layout,
  Typography,
  Row,
  Col,
  Card,
  Statistic,
  List,
  Avatar,
  Spin,
} from "antd";
import {
  BookOutlined,
  CalendarOutlined,
  MessageOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchDashboardData } from "../../store/dasboard/slice";
import styled from "styled-components";

const { Content } = Layout;
const { Title, Text } = Typography;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
  background: #f0f2f5;
`;

const StyledContent = styled(Content)`
  padding: 24px;
  margin: 0 auto;
  max-width: 1200px;
`;

const StyledCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  height: 100%;
`;

const StatCard = styled(StyledCard)`
  text-align: center;
`;

const ListCard = styled(StyledCard)`
  .ant-card-head-title {
    font-size: 18px;
  }
`;

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    upcomingAssignments,
    recentAnnouncements,
    courseStats,
    isLoading,
    error,
  } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    const notLogin = false;
    if (notLogin) dispatch(fetchDashboardData());
  }, [dispatch]);

  if (isLoading) {
    return (
      <StyledLayout>
        <StyledContent>
          <Spin size="large" />
        </StyledContent>
      </StyledLayout>
    );
  }

  if (error) {
    return (
      <StyledLayout>
        <StyledContent>
          <Title level={2}>Error</Title>
          <Text type="danger">{error}</Text>
        </StyledContent>
      </StyledLayout>
    );
  }

  return (
    <StyledLayout>
      <StyledContent>
        <Title level={2} style={{ marginBottom: 24 }}>
          Dashboard
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8}>
            <StatCard>
              <Statistic
                title="Active Courses"
                value={courseStats.activeCourses}
                prefix={<BookOutlined style={{ color: "#1890ff" }} />}
              />
            </StatCard>
          </Col>
          <Col xs={24} sm={8}>
            <StatCard>
              <Statistic
                title="Upcoming Assignments"
                value={courseStats.upcomingAssignments}
                prefix={<CalendarOutlined style={{ color: "#52c41a" }} />}
              />
            </StatCard>
          </Col>
          <Col xs={24} sm={8}>
            <StatCard>
              <Statistic
                title="New Messages"
                value={courseStats.newMessages}
                prefix={<MessageOutlined style={{ color: "#faad14" }} />}
              />
            </StatCard>
          </Col>
          <Col xs={24} md={12}>
            <ListCard
              title="Upcoming Assignments"
              extra={<a href="#">View All</a>}
            >
              <List
                itemLayout="horizontal"
                dataSource={upcomingAssignments}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={<CalendarOutlined />}
                          style={{ backgroundColor: "#1890ff" }}
                        />
                      }
                      title={item.title ? <a href="#">{item.title}</a> : null}
                      description={`Due: ${item.dueDate}`}
                    />
                  </List.Item>
                )}
              />
            </ListCard>
          </Col>
          <Col xs={24} md={12}>
            <ListCard
              title="Recent Announcements"
              extra={<a href="#">View All</a>}
            >
              <List
                style={{
                  padding: "10px",
                }}
                itemLayout="horizontal"
                dataSource={recentAnnouncements}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={<BellOutlined />}
                          style={{ backgroundColor: "#52c41a" }}
                        />
                      }
                      title={<a href="#">{item.title}</a>}
                      description={
                        item.content.length > 50
                          ? `${item.content.substring(0, 50)}...`
                          : item.content
                      }
                    />
                  </List.Item>
                )}
              />
            </ListCard>
          </Col>
        </Row>
      </StyledContent>
    </StyledLayout>
  );
};

export default Dashboard;
