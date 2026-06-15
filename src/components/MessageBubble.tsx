import React, { useState } from "react";
import { ChatMessage } from "../types";
import { formatTime } from "../utils/chatParser";
import {
  IoImage,
  IoVideocam,
  IoMic,
  IoDocument,
  IoPerson,
  IoLocation,
  IoTrash,
  IoCheckmarkDone,
} from "react-icons/io5";

interface MessageBubbleProps {
  message: ChatMessage;
  showSender: boolean;
}

const SENDER_COLORS = [
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
  "#009688",
  "#4CAF50",
  "#FF5722",
  "#FF9800",
  "#00BCD4",
  "#8BC34A",
  "#F44336",
];

function getSenderColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return SENDER_COLORS[Math.abs(h) % SENDER_COLORS.length];
}

function parseText(text: string): React.ReactNode {
  let key = 0;
  const parse = (s: string): (string | JSX.Element)[] => {
    const result: (string | JSX.Element)[] = [];
    const patterns = [
      { regex: /\*([^*]+)\*/, tag: "strong" as const },
      { regex: /_([^_]+)_/, tag: "em" as const },
      { regex: /~([^~]+)~/, tag: "s" as const },
    ];
    while (s.length > 0) {
      let earliest: {
        index: number;
        match: RegExpMatchArray;
        tag: "strong" | "em" | "s";
      } | null = null;
      for (const { regex, tag } of patterns) {
        const m = s.match(regex);
        if (
          m &&
          m.index !== undefined &&
          (!earliest || m.index < earliest.index)
        )
          earliest = { index: m.index, match: m, tag };
      }
      if (!earliest) {
        result.push(s);
        break;
      }
      if (earliest.index > 0) result.push(s.slice(0, earliest.index));
      result.push(
        React.createElement(earliest.tag, { key: key++ }, earliest.match[1]),
      );
      s = s.slice(earliest.index + earliest.match[0].length);
    }
    return result;
  };
  return <>{parse(text)}</>;
}

/* Reusable omitted media placeholder */
const OmittedPlaceholder: React.FC<{
  icon: React.ReactNode;
  label: string;
  isMe: boolean;
}> = ({ icon, label, isMe }) => (
  <div
    className={`flex items-center gap-2 text-sm italic ${isMe ? "text-white/60" : "text-gray-400"}`}
  >
    {icon}
    <span>{label} omitted</span>
  </div>
);

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showSender,
}) => {
  const [imgError, setImgError] = useState(false);

  if (message.isSystem) {
    return (
      <div className="flex justify-center my-1">
        <span className="bg-[#1f2c34] text-gray-400 text-xs px-3 py-1 rounded-full max-w-xs text-center">
          {message.content}
        </span>
      </div>
    );
  }

  const isMe = message.isMe;
  const iconColor = isMe ? "rgba(255,255,255,0.6)" : "#54656f";

  const renderContent = () => {
    switch (message.type) {
      case "media":
      case "sticker":
        if (message.mediaFile && !imgError)
          return (
            <div className="rounded-lg overflow-hidden max-w-[220px]">
              <img
                src={message.mediaFile.url}
                alt="Media"
                className="w-full object-cover"
                onError={() => setImgError(true)}
              />
            </div>
          );
        return (
          <OmittedPlaceholder
            icon={<IoImage size={18} color={iconColor} />}
            label="Image"
            isMe={isMe}
          />
        );

      case "video":
        if (message.mediaFile)
          return (
            <div className="rounded-lg overflow-hidden max-w-[220px]">
              <video src={message.mediaFile.url} controls className="w-full" />
            </div>
          );
        return (
          <OmittedPlaceholder
            icon={<IoVideocam size={18} color={iconColor} />}
            label="Video"
            isMe={isMe}
          />
        );

      case "audio":
        if (message.mediaFile)
          return (
            <div className="flex items-center gap-2">
              <IoMic size={20} color={isMe ? "#fff" : "#25D366"} />
              <audio
                src={message.mediaFile.url}
                controls
                className="h-8 max-w-[160px]"
              />
            </div>
          );
        return (
          <OmittedPlaceholder
            icon={<IoMic size={18} color={iconColor} />}
            label="Audio"
            isMe={isMe}
          />
        );

      case "document":
        if (message.mediaFile)
          return (
            <a
              href={message.mediaFile.url}
              download={message.mediaFile.name}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 ${isMe ? "bg-white/10 hover:bg-white/20" : "bg-black/10 hover:bg-black/20"} transition-colors`}
            >
              <IoDocument size={28} color={isMe ? "#fff" : "#54656f"} />
              <div className="flex flex-col min-w-0">
                <span
                  className={`text-sm font-medium truncate max-w-[140px] ${isMe ? "text-white" : "text-gray-200"}`}
                >
                  {message.mediaFile.name}
                </span>
                <span
                  className={`text-xs ${isMe ? "text-white/60" : "text-gray-400"}`}
                >
                  Document
                </span>
              </div>
            </a>
          );
        return (
          <OmittedPlaceholder
            icon={<IoDocument size={18} color={iconColor} />}
            label="Document"
            isMe={isMe}
          />
        );

      case "contact":
        return (
          <div
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${isMe ? "bg-white/10" : "bg-black/10"}`}
          >
            <div className="w-9 h-9 rounded-full bg-gray-500 flex items-center justify-center shrink-0">
              <IoPerson size={20} color="#fff" />
            </div>
            <div className="flex flex-col">
              <span
                className={`text-xs ${isMe ? "text-white/60" : "text-gray-400"}`}
              >
                Contact Card
              </span>
              <span
                className={`text-sm font-medium ${isMe ? "text-white" : "text-gray-200"}`}
              >
                {message.content.replace(/\.vcf.*$/i, "")}
              </span>
            </div>
          </div>
        );

      case "location":
        return (
          <div className="flex items-center gap-2">
            <IoLocation size={18} color={isMe ? "#fff" : "#25D366"} />
            <span
              className={`text-sm ${isMe ? "text-white" : "text-gray-200"}`}
            >
              {message.content}
            </span>
          </div>
        );

      case "deleted":
        return (
          <span
            className={`flex items-center gap-1 text-sm italic ${isMe ? "text-white/60" : "text-gray-400"}`}
          >
            <IoTrash size={14} />
            {message.content}
          </span>
        );

      default:
        return (
          <span
            className={`text-sm leading-relaxed break-all whitespace-pre-wrap overflow-hidden block ${isMe ? "text-white" : "text-gray-100"}`}
          >
            {parseText(message.content)}
          </span>
        );
    }
  };

  return (
    <div className={`flex mb-1 px-1 ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[75%] min-w-0 overflow-hidden rounded-2xl px-3 py-2 shadow
          ${isMe ? "bg-[#005c4b] rounded-tr-sm" : "bg-[#1f2c34] rounded-tl-sm"}`}
      >
        {showSender && !isMe && (
          <span
            className="block text-xs font-semibold mb-0.5"
            style={{ color: getSenderColor(message.sender) }}
          >
            {message.sender}
          </span>
        )}
        {renderContent()}
        <div className="flex items-center justify-end gap-1 mt-0.5">
          <span className="text-[10px] text-gray-400">
            {formatTime(message.timestamp)}
          </span>
          {isMe && <IoCheckmarkDone size={16} color="#53BDEB" />}
        </div>
      </div>
    </div>
  );
};
