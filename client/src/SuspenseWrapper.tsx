import { Suspense } from "react";
import { SpinnerOverlay } from "@/components/ui/spinner";

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<SpinnerOverlay />}>{children}</Suspense>
);

export default SuspenseWrapper;
