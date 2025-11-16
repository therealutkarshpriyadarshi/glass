import React from "react";
import { Row, Col, Tabs } from "antd";
import {
  AppstoreOutlined,
  FileOutlined,
  UsergroupAddOutlined,
  MessageOutlined,
  CalendarOutlined,
  DownSquareOutlined,
} from "@ant-design/icons";
import Announcement from "./announcement/Announcement";
import CoursePeople from "./people/CoursePeople";
import AddDropDown from "./AddDropDown";

const CourseOverview: React.FC = () => {
  const onTabChange = (key: string) => {
    console.log(key);
  };

  return (
    <div
      style={{
        height: "90vh",
        overflow: "auto",
        position: "relative",
      }}
    >
      <Row
        style={{
          padding: "10px",
          overflow: "auto",
        }}
      >
        <Col span={24}>
          <Tabs
            animated={{
              inkBar: true,
              tabPane: true,
            }}
            onChange={onTabChange}
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              backgroundColor: "white",
              paddingTop: "10px",
            }}
            tabBarExtraContent={{
              right: <AddDropDown />,
            }}
          >
            <Tabs.TabPane
              tab="Announcements"
              key="1"
              icon={<AppstoreOutlined />}
            >
              <Announcement />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab="Files"
              key="2"
              icon={<FileOutlined />}
            ></Tabs.TabPane>
            <Tabs.TabPane tab="People" key="3" icon={<UsergroupAddOutlined />}>
              <CoursePeople />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab="Chat"
              key="4"
              icon={<MessageOutlined />}
            ></Tabs.TabPane>
            <Tabs.TabPane
              tab="Calendar"
              key="5"
              icon={<CalendarOutlined />}
            ></Tabs.TabPane>
            <Tabs.TabPane
              tab="Submissions"
              key="6"
              icon={<DownSquareOutlined />}
            ></Tabs.TabPane>
          </Tabs>
        </Col>
      </Row>
    </div>
  );
};

export default CourseOverview;
