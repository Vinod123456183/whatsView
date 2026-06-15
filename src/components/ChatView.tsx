import React, { useEffect, useRef, useState, useCallback } from "react";
import { ParsedChat } from "../types";
import { groupMessagesByDate } from "../utils/chatParser";
import { MessageBubble } from "./MessageBubble";
import { Avatar } from "./Avatar";
import {
  IoArrowBack,
  IoPerson,
  IoChevronUp,
  IoChevronDown,
} from "react-icons/io5";

interface ChatViewProps {
  chat: ParsedChat;
  onReset: () => void;
  onChangeSender: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  chat,
  onReset,
  onChangeSender,
}) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [showScrollBtns, setShowScrollBtns] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isAtTop, setIsAtTop] = useState(false);

  const isGroupChat = chat.participants.length > 2;
  const groups = groupMessagesByDate(chat.messages);
  const otherName = chat.participants.find((p) => p !== chat.myName) || "Chat";

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    requestAnimationFrame(() => {
      setShowScrollBtns(el.scrollHeight > el.clientHeight + 200);
      setIsAtBottom(true);
      setIsAtTop(false);
    });
  }, [chat]);

  const handleScroll = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsAtBottom(distFromBottom < 80);
    setIsAtTop(el.scrollTop < 80);
    setShowScrollBtns(el.scrollHeight > el.clientHeight + 200);
  }, []);

  const scrollToTop = () => {
    const el = bodyRef.current;
    if (el) el.scrollTop = 0;
  };
  const scrollToBottom = () => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  return (
    /*
      One single bg-[#0b141a] covers everything — outer wrapper fills the screen,
      inner card is centered and constrained to max-w-2xl so it never stretches on
      wide monitors, matching WhatsApp Web's layout.
    */
    <div className="flex justify-center items-stretch h-screen bg-[#0b141a]">
      {/* Chat panel — centered, max width so it never goes full-screen on wide displays */}
      <div className="flex flex-col w-full max-w-3xl h-screen">
        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-3 py-2 bg-[#1f2c34] shrink-0 rounded rounded-2xl">
          <button
            onClick={onReset}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Back"
          >
            <IoArrowBack size={22} color="white" />
          </button>

          <Avatar name={isGroupChat ? "G" : otherName} size="sm" />

          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-white font-semibold text-sm truncate">
              {isGroupChat
                ? chat.participants.slice(0, 3).join(", ") +
                  (chat.participants.length > 3 ? " …" : "")
                : otherName}
            </span>
            <span className="text-gray-400 text-xs">
              {isGroupChat
                ? `${chat.participants.length} participants`
                : "WhatsApp chat"}
            </span>
          </div>

          <button
            onClick={onChangeSender}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Change identity"
          >
            <IoPerson size={20} color="white" />
          </button>
        </div>

        {/* ── Messages area — same bg as outer so no colour seam ── */}
        <div
          ref={bodyRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-3 py-2 relative bg-[#0b141a] scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {/* Identity pill */}
          <div className="flex justify-center mb-3">
            <button
              onClick={onChangeSender}
              className="bg-[#1f2c34] text-gray-300 text-xs px-3 py-1 rounded-full hover:bg-[#2a3942] transition-colors"
            >
              Viewing as <strong className="text-white">{chat.myName}</strong> ·
              change
            </button>
          </div>

          {groups.map(({ dateLabel, messages }) => (
            <div key={dateLabel}>
              {/* Date separator */}
              <div className="flex justify-center my-3">
                <span className="bg-[#1f2c34] text-gray-400 text-xs px-3 py-1 rounded-full">
                  {dateLabel}
                </span>
              </div>

              {messages.map((msg, idx) => {
                const prev = idx > 0 ? messages[idx - 1] : null;
                const showSender =
                  isGroupChat &&
                  !msg.isSystem &&
                  (!prev || prev.sender !== msg.sender || prev.isSystem);
                return (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    showSender={showSender}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* ── Scroll buttons — fixed to viewport, right side ── */}
        <div className="fixed bottom-24 right-5 flex flex-col gap-3 z-[9999]">
          <button
            onClick={scrollToTop}
            title="Jump to oldest"
            className="w-12 h-12 flex items-center justify-center rounded-full shadow-2xl border-2 bg-white border-white text-[#075e54] hover:bg-gray-100 active:scale-95 transition-all"
          >
            <IoChevronUp size={22} />
          </button>
          <button
            onClick={scrollToBottom}
            title="Jump to latest"
            className="w-12 h-12 flex items-center justify-center rounded-full shadow-2xl border-2 bg-[#25D366] border-[#25D366] text-white hover:bg-[#1da851] active:scale-95 transition-all"
          >
            <IoChevronDown size={22} />
          </button>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#1f2c34] shrink-0">
          <div className="flex-1 flex items-center bg-[#2a3942] rounded-full px-4 py-2">
            <span className="text-gray-500 text-sm text-center w-full text-red-500 ">
              Don't Refresh While Reading | Read Only Feature
            </span>
          </div>
        </div>

        {/* ── Stats bar — same bg so no seam ── */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-600 py-1.5 bg-[#0b141a] shrink-0">
          <span>
            {chat.messages.filter((m) => !m.isSystem).length} messages
          </span>
          <span>·</span>
          <span>{chat.participants.length} participants</span>
          <span>·</span>
          <span>
            {
              chat.messages.filter((m) => m.type !== "text" && !m.isSystem)
                .length
            }{" "}
            media
          </span>
        </div>
      </div>
    </div>
  );
};
