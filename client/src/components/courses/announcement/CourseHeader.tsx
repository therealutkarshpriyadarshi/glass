import React, { useEffect, useState } from "react";
import "./header.css";
import { Image, Typography } from "antd";

interface CourseHeaderProps {
  title: string;
}

const { Title } = Typography;

const CourseHeader: React.FC<CourseHeaderProps> = ({ title }) => {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const fetchRandomImage = async () => {
      try {
        const response = await fetch(
          "https://images.unsplash.com/photo-1629459347138-b34fcc7603cc?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        );
        setImageUrl(response.url);
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };

    fetchRandomImage();
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 200,
        padding: 0,
        overflow: "hidden",
        borderRadius: "30px",
      }}
    >
      <Title
        className="title"
        level={2}
        style={{ color: "#ff7", cursor: "pointer" }}
      >
        {title}
      </Title>
      <Image
        src={imageUrl}
        alt="Course landscape"
        preview={true}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "10px",
        }}
      />
      <div className="image-mask"></div>
    </div>
  );
};

export default CourseHeader;
