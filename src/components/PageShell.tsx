// Shared page wrapper used by ContactPage and DonatePage
import React from "react";
import { IoArrowBack } from "react-icons/io5";

interface PageShellProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

export const PageShell: React.FC<PageShellProps> = ({ title, onBack, children }) => (
  <div className="min-h-screen bg-gray-950 text-white flex flex-col">
    <div className="flex items-center gap-3 px-4 py-3 bg-[#1f2c34] border-b border-gray-800 sticky top-0 z-10">
      <button
        onClick={onBack}
        className="p-2 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Back"
      >
        <IoArrowBack size={22} color="white" />
      </button>
      <span className="text-base font-semibold">{title}</span>
    </div>
    <div className="flex-1 flex flex-col items-center px-4 py-8 w-full">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  </div>
);
