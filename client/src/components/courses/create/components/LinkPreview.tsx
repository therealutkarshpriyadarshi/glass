import React, { useState, useEffect, useCallback } from "react";
import { Link as LinkIcon } from "lucide-react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

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
    <div className="p-4 space-y-4">
      <div className="relative">
        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
          className="pl-10"
        />
      </div>
      <Button onClick={fetchLinkPreview} disabled={!url || loading}>
        Get Preview
      </Button>

      {loading && <Spinner />}

      {preview && (
        <Card className="max-w-md hover:shadow-lg transition-shadow cursor-pointer">
          <img
            alt={preview.title}
            src={preview.image}
            className="object-cover h-40 w-full rounded-t-lg"
          />
          <CardHeader>
            <CardTitle>
              <a
                href={preview.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {preview.title}
              </a>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {preview.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LinkPreview;
