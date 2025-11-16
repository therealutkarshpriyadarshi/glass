import { Suspense } from "react";
import { Spin } from "antd";

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Spin size="large" />}>{children}</Suspense>
);

export default SuspenseWrapper;
