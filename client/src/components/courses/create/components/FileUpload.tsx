import React, { useState } from "react";
import { Upload, UploadFile } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import styled from "styled-components";

const { Dragger } = Upload;

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
}

const StyledDragger = styled(Dragger)`
  .ant-upload-drag-icon {
    color: #40a9ff;
    font-size: 48px;
    margin-bottom: 16px;
  }
  .ant-upload-text {
    font-size: 16px;
    color: #000000d9;
  }
  .ant-upload-hint {
    font-size: 14px;
    color: #00000073;
  }
`;

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleFileChange = (info: any) => {
    const newFileList = info.fileList.map((file: UploadFile) => ({
      ...file,
      status: "done",
    }));
    setFileList(newFileList);
    const files = newFileList.map((file: UploadFile) => file.originFileObj);
    onFilesSelected(files);
  };

  const props = {
    name: "file",
    multiple: true,
    fileList: fileList,
    beforeUpload: (file: UploadFile) => {
      console.log("beforeUpload", file);
      return false;
    },
    onChange: handleFileChange,
  };

  return (
    <StyledDragger {...props}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">
        Click or drag files to this area to select
      </p>
      <p className="ant-upload-hint">
        You can select multiple files. They will be uploaded when you submit the
        form.
      </p>
    </StyledDragger>
  );
};

export default FileUpload;
