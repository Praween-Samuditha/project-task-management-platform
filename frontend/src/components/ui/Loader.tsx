import { Loader2 } from "lucide-react";

interface LoaderProps {
  text?: string;
  fullScreen?: boolean;
}

export default function Loader({ text = "Loading...", fullScreen = false }: LoaderProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">{text}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center gap-2 py-12">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      <span className="text-sm text-gray-500">{text}</span>
    </div>
  );
}
