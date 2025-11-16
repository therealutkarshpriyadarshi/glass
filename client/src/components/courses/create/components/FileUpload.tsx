import React, { useState, useRef } from "react";
import { Upload } from "lucide-react";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected }) => {
  const [fileList, setFileList] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files) {
      const filesArray = Array.from(files);
      setFileList(filesArray);
      onFilesSelected(filesArray);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
        <p className="text-base text-foreground mb-2">
          Click or drag files to this area to select
        </p>
        <p className="text-sm text-muted-foreground">
          You can select multiple files. They will be uploaded when you submit
          the form.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files)}
        />
      </div>
      {fileList.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-foreground">
            Selected files ({fileList.length}):
          </p>
          {fileList.map((file, index) => (
            <div
              key={index}
              className="text-sm text-muted-foreground flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {file.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
