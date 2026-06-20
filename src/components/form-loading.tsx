import { RoveLoader } from "@/components/rove-loader";

export function FormLoading({ title = "Loading form" }: { title?: string }) {
  return <RoveLoader label={title} />;
}
