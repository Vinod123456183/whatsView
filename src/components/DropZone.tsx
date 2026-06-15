import React, { useCallback, useState } from "react";
import { IoLogoWhatsapp, IoCloudUpload, IoAdd } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const steps = [
  "Open WhatsApp → Chat → ⋮ → More → Export Chat",
  'Choose "With Media" or "Without Media"',
  "Upload the exported .zip or .txt file here",
];

export const DropZone: React.FC<DropZoneProps> = ({ onFileSelect, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);
  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] px-4 py-10 bg-gray-950">
      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center mb-4 shadow-lg shadow-green-900/40">
          <IoLogoWhatsapp size={36} color="white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">WhatsApp Chat Viewer</h1>
        <p className="text-gray-400 text-sm max-w-xs">View your exported WhatsApp chats with the original look and feel</p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full max-w-md rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center py-12 px-6 mb-8
          ${isDragging ? "border-[#25D366] bg-[#25D366]/10" : "border-gray-700 bg-gray-900"}
          ${isLoading ? "pointer-events-none opacity-70" : "hover:border-[#25D366]/60 hover:bg-gray-800 cursor-pointer"}`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <AiOutlineLoading3Quarters size={40} className="animate-spin text-[#25D366]" />
            <p className="text-sm">Reading your chat...</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              {isDragging
                ? <IoAdd size={56} color="#25D366" />
                : <IoCloudUpload size={56} color={isDragging ? "#25D366" : "#4b5563"} />}
            </div>
            <p className="text-white font-medium mb-1">{isDragging ? "Drop your file here!" : "Drop your WhatsApp export here"}</p>
            <p className="text-gray-500 text-sm mb-6">Supports .zip and .txt files</p>
            <label className="px-5 py-2 bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
              <input type="file" accept=".zip,.txt" onChange={handleInput} className="hidden" />
              Browse Files
            </label>
          </>
        )}
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        {steps.map((text, i) => (
          <div key={i} className="flex items-center gap-3 bg-gray-900 rounded-xl px-4 py-3">
            <span className="w-6 h-6 rounded-full bg-[#25D366] text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
            <span className="text-gray-300 text-sm">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
