import React from "react";
import { Typography } from "antd";
import styled, { keyframes } from "styled-components";

const { Text } = Typography;

const slideIn = keyframes`
  from { transform: translateX(-50px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const StyledList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const FeatureItem = styled.li`
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  animation: ${slideIn} 0.5s ease-out;
`;

const FeatureIcon = styled.span`
  margin-right: 10px;
  font-size: 1.2rem;
`;

const features = [
  { icon: "✅", text: "Interactive online classrooms" },
  { icon: "📚", text: "Comprehensive course management" },
  { icon: "📊", text: "Real-time progress tracking" },
  { icon: "🤝", text: "Collaborative learning tools" },
];

const FeatureList: React.FC = () => (
  <StyledList>
    {features.map((feature) => (
      <FeatureItem key={feature.text}>
        <FeatureIcon>{feature.icon}</FeatureIcon>
        <Text style={{ color: "white" }}>{feature.text}</Text>
      </FeatureItem>
    ))}
  </StyledList>
);

export default FeatureList;
