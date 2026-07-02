import { Image as ImageIcon } from "lucide-react";
export function ImagePlaceholder({ className = "" }: { className?: string }) {
  return (
    <div
      className={`aspect-[4/3] bg-[#EFECE6] rounded-2xl flex flex-col items-center justify-center text-[#6F8A5E] border border-[#6F8A5E]/20 overflow-hidden relative ${className}`}>
      {/* Subtle decorative blossom hints in the background */}
      <div className="absolute top-[-10%] left-[-10%] w-32 h-32 bg-[#E48BA3]/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-32 h-32 bg-[#E48BA3]/10 rounded-full blur-2xl"></div>

      <ImageIcon className="w-12 h-12 mb-3 opacity-50" strokeWidth={1.5} />
      <span className="font-medium text-sm opacity-70">Fotografie 4:3</span>
    </div>
  );
}
