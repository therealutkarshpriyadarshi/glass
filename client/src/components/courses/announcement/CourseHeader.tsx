import React, { useEffect, useState } from "react";

interface CourseHeaderProps {
  title: string;
}

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
    <div className="relative w-full h-[200px] p-0 overflow-hidden rounded-3xl">
      <h2 className="absolute top-4 left-4 z-10 text-3xl font-bold text-warning cursor-pointer">
        {title}
      </h2>
      <img
        src={imageUrl}
        alt="Course landscape"
        className="w-full h-full object-cover rounded-xl cursor-pointer"
        onClick={() => window.open(imageUrl, "_blank")}
      />
      <div className="absolute inset-0 bg-black/30 rounded-xl" />
    </div>
  );
};

export default CourseHeader;
