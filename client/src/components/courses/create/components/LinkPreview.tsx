import React, { useState, useEffect, useCallback } from "react";
import { Input, Card, Spin, Button } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import axios from "axios";

interface LinkPreviewProps {
  url: string;
  setUrl: (url: string) => void;
}

interface PreviewData {
  title: string;
  description: string;
  image: string;
  url: string;
}

const LinkPreview: React.FC<LinkPreviewProps> = ({ url, setUrl }) => {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLinkPreview = useCallback(async () => {
    setLoading(true);
    setPreview(null);

    try {
      const response = await axios.get(`https://api.linkpreview.net`, {
        params: {
          q: url,
          key: "8f01d938aeb6b5fc17a32ab1ae16f340",
        },
      });

      const previewData: PreviewData = {
        title: response.data.title || "No title available",
        description: response.data.description || "No description available",
        image: response.data.image || "/api/placeholder/300/200",
        url: response.data.url || url,
      };

      setPreview(previewData);
    } catch (error) {
      console.error("Error fetching link preview:", error);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (url) {
        fetchLinkPreview();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [url, fetchLinkPreview]);

  return (
    <div className="p-4">
      <Input
        prefix={<LinkOutlined className="text-gray-400" />}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL"
        className="mb-4"
      />
      <Button
        type="primary"
        onClick={fetchLinkPreview}
        disabled={!url}
        className="mb-4"
      >
        Get Preview
      </Button>

      {loading && <Spin className="block mb-4" />}

      {preview && (
        <Card
          hoverable
          cover={
            <img
              alt={preview.title}
              src={preview.image}
              className="object-cover h-40"
            />
          }
          className="max-w-md"
        >
          <Card.Meta
            title={
              <a href={preview.url} target="_blank" rel="noopener noreferrer">
                {preview.title}
              </a>
            }
            description={preview.description}
          />
        </Card>
      )}
    </div>
  );
};

export default LinkPreview;
