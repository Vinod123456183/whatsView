import React from "react";
import { IoPerson, IoCheckmark } from "react-icons/io5";
import { Avatar } from "./Avatar";

interface SenderSelectorProps {
  participants: string[];
  myName: string;
  onSelect: (name: string) => void;
}

export const SenderSelector: React.FC<SenderSelectorProps> = ({ participants, myName, onSelect }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
    <div className="bg-gray-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-full bg-[#25D366]/20 flex items-center justify-center">
          <IoPerson size={32} color="#25D366" />
        </div>
      </div>
      <h2 className="text-white text-xl font-bold text-center mb-1">Who are you in this chat?</h2>
      <p className="text-gray-400 text-sm text-center mb-6">
        Select your name so your messages appear on the right side.
      </p>

      <div className="flex flex-col gap-2 mb-5">
        {participants.map((name) => {
          const selected = name === myName;
          return (
            <button
              key={name}
              onClick={() => onSelect(name)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left
                ${selected ? "border-[#25D366] bg-[#25D366]/10" : "border-gray-700 bg-gray-800 hover:border-gray-500"}`}
            >
              <Avatar name={name} size="sm" />
              <span className="text-white font-medium flex-1">{name}</span>
              {selected && <IoCheckmark size={20} color="#25D366" />}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onSelect(myName)}
        className="w-full py-3 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold rounded-xl transition-colors"
      >
        Continue as {myName}
      </button>
    </div>
  </div>
);
