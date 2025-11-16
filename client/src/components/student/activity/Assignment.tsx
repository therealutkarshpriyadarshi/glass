import React, { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Assignment } from "../../../store/activity/type";
import ActivityTemplate from "./ActivityTemplate";
import { useAppSelector } from "../../../store/hooks";

const Assignment: React.FC = () => {
  const assignment = useAppSelector(
    ({ activityAssignment }) => activityAssignment.assignment
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return assignment ? (
    <ActivityTemplate activity={assignment}>
      <div className="mt-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <Button onClick={handleUploadClick} variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
        {selectedFiles.length > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            {selectedFiles.length} file(s) selected
          </div>
        )}
      </div>
    </ActivityTemplate>
  ) : (
    <div>No assignment found</div>
  );
};

export default Assignment;
