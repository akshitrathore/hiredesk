import { RoveLoader } from "@/components/rove-loader";

export function PageLoading({
  title = "Loading workspace",
}: {
  title?: string;
  rows?: number;
}) {
  return <RoveLoader label={title} />;
}
