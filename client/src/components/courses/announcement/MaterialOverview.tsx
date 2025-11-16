import React from "react";
import styled from "styled-components";
import { List, Avatar, Typography, Space } from "antd";
import { FileOutlined, LinkOutlined } from "@ant-design/icons";
import type { Material } from "../../../store/materials/type";

const { Text } = Typography;

interface MaterialOverviewProps {
  materials: Material[];
}

const StyledListItem = styled(List.Item)`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f9f9f9;
  }
`;

const MaterialAvatar = styled(Avatar)`
  background-color: #52c41a;
`;

const MaterialTitle = styled(Typography.Title)`
  margin-bottom: 0 !important;
`;

const LinkList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 8px 0 0 0;
`;

const LinkItem = styled.li`
  margin-bottom: 4px;
`;

const MaterialOverview: React.FC<MaterialOverviewProps> = ({ materials }) => {
  return (
    <List
      itemLayout="horizontal"
      dataSource={materials}
      renderItem={(material) => (
        <StyledListItem>
          <List.Item.Meta
            avatar={<MaterialAvatar icon={<FileOutlined />} />}
            title={<MaterialTitle level={4}>{material.title}</MaterialTitle>}
            description={
              <Space direction="vertical" size="small">
                <Text>{material.description}</Text>
                {(material.fileLinks.length > 0 ||
                  material.links.length > 0) && (
                  <LinkList>
                    {material.fileLinks.map((link, index) => (
                      <LinkItem key={`file-${index}`}>
                        <FileOutlined />{" "}
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          File {index + 1}
                        </a>
                      </LinkItem>
                    ))}
                    {material.links.map((link, index) => (
                      <LinkItem key={`link-${index}`}>
                        <LinkOutlined />{" "}
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Link {index + 1}
                        </a>
                      </LinkItem>
                    ))}
                  </LinkList>
                )}
              </Space>
            }
          />
        </StyledListItem>
      )}
    />
  );
};

export default MaterialOverview;
