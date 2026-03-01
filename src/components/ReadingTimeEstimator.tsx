import { Clock } from "lucide-react";

interface ReadingTimeEstimatorProps {
  content: string;
}

const ReadingTimeEstimator = ({ content }: ReadingTimeEstimatorProps) => {
  const text = content.replace(/<[^>]*>/g, "");
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));

  return (
    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
      <Clock className="h-3.5 w-3.5" />
      {minutes} min read
    </span>
  );
};

export default ReadingTimeEstimator;
