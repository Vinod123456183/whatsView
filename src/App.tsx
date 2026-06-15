import React, { useState, useCallback } from "react";
import { DropZone } from "./components/DropZone";
import { SenderSelector } from "./components/SenderSelector";
import { ChatView } from "./components/ChatView";
import { ContactPage } from "./components/ContactPage";
import { DonatePage } from "./components/DonatePage";
import { parseChatFile } from "./utils/chatParser";
import { readZipFile, readTextFile } from "./utils/fileReader";
import { ParsedChat, MediaFile } from "./types";
import { IoLogoWhatsapp } from "react-icons/io5";
import { MdEmail, MdFavorite } from "react-icons/md";

type AppState = "upload" | "select-sender" | "chat" | "contact" | "donate";

export const App: React.FC = () => {
  const [state, setState] = useState<AppState>("upload");
  const [chat, setChat] = useState<ParsedChat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      let text = "";
      let mediaFiles = new Map<string, MediaFile>();
      if (file.name.endsWith(".zip")) {
        const result = await readZipFile(file);
        text = result.text;
        mediaFiles = result.mediaFiles;
      } else if (file.name.endsWith(".txt")) {
        text = await readTextFile(file);
      } else {
        throw new Error(
          "Please upload a .zip or .txt file exported from WhatsApp.",
        );
      }
      if (!text?.trim())
        throw new Error(
          "No chat text found. Make sure the file is a valid WhatsApp export.",
        );
      const parsed = parseChatFile(text, mediaFiles);
      if (parsed.messages.length === 0)
        throw new Error("Could not parse any messages.");
      setChat(parsed);
      setState("select-sender");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read file.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSenderSelect = useCallback(
    (name: string) => {
      if (!chat) return;
      setChat({
        ...chat,
        myName: name,
        messages: chat.messages.map((msg) => ({
          ...msg,
          isMe: msg.sender === name && !msg.isSystem,
        })),
      });
      setState("chat");
    },
    [chat],
  );

  const handleReset = useCallback(() => {
    setState("upload");
    setChat(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 font-sans">
      {state === "upload" && (
        <nav className="flex items-center justify-between px-5 py-3 bg-[#1f2c34] border-b border-gray-800">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <IoLogoWhatsapp size={24} color="#25D366" />
            <span>whatsView</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setState("contact")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-300 hover:text-white bg-blue-700 hover:bg-blue-600 text-sm transition-colors"
            >
              <MdEmail size={16} />
              Contact
            </button>
            <button
              onClick={() => setState("donate")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
            >
              <MdFavorite size={16} />
              Donate
            </button>
          </div>
        </nav>
      )}

      {state === "upload" && (
        <DropZone onFileSelect={handleFileSelect} isLoading={isLoading} />
      )}
      {state === "select-sender" && chat && (
        <SenderSelector
          participants={chat.participants}
          myName={chat.myName}
          onSelect={handleSenderSelect}
        />
      )}
      {state === "chat" && chat && (
        <ChatView
          chat={chat}
          onReset={handleReset}
          onChangeSender={() => setState("select-sender")}
        />
      )}
      {state === "contact" && <ContactPage onBack={handleReset} />}
      {state === "donate" && <DonatePage onBack={handleReset} />}

      {error && (
        <div
          onClick={() => setError(null)}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg cursor-pointer max-w-sm w-full z-50"
        >
          <span className="text-sm flex-1">{error}</span>
          <span className="text-xs opacity-70">✕</span>
        </div>
      )}
    </div>
  );
};
