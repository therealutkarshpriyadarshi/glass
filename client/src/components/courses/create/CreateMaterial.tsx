import React, { useState } from "react";
import { Form, Input, Button, Row, Col } from "antd";
import Description from "./components/Description";
import FileUpload from "./components/FileUpload";
import CourseDropdown from "./components/CourseDropdown";

/**
 * CreateMaterial component for creating new course material
 *
 * This component renders a form for creating new course material. It includes
 * fields for the material title, description, and file uploads.
 *
 * @component
 * @returns {JSX.Element} Rendered CreateMaterial component
 */
const CreateMaterial: React.FC = (): JSX.Element => {
  const [form] = Form.useForm();
  const [markdown, setMarkdown] = useState<string>("");

  const onFinish = (values: any) => {
    console.log("Form values:", values);
    // Handle form submission
  };

  const handleUpload = (files: File[]) => {
    console.log("Uploading file:", files);
  };

  const handleCourseSelect = (value: string) => {
    console.log("Selected course:", value);
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Form.Item
            name="title"
            label="Material Title"
            rules={[{ required: true, message: "Please input the title!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Material Description"
            rules={[
              { required: true, message: "Please input the description!" },
            ]}
          >
            <Description
              markdown={markdown}
              onChange={setMarkdown}
              editorRef={null}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="course"
            label="Course"
            rules={[{ required: true, message: "Please select a course!" }]}
          >
            <CourseDropdown onSelect={handleCourseSelect} />
          </Form.Item>

          <Form.Item
            name="files"
            label="Add Files"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) return e;
              return e && e.fileList;
            }}
          >
            <FileUpload onFilesSelected={handleUpload} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Create Material
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateMaterial;
