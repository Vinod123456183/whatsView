import React from "react";
import { IoHeart } from "react-icons/io5";
import { PageShell } from "./PageShell";

// Import QR image
import donateQR from "../assets/qr/donate-qr.png";

export const DonatePage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <PageShell title="Support whatsView" onBack={onBack}>
    {/* Hero Section */}
    <div className="flex flex-col items-center text-center mb-8">
      <div className="w-16 h-16 rounded-full bg-pink-600 flex items-center justify-center mb-4">
        <IoHeart size={32} color="white" />
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">Buy Us a Coffee ☕</h1>

      <p className="text-gray-400 text-sm max-w-md leading-relaxed">
        whatsView is 100% free and open-source. If it helped you, consider
        supporting us with a small donation.
      </p>
    </div>

    {/* QR Code Card */}
    <div className="flex flex-col items-center bg-gray-900 border border-gray-800 rounded-2xl px-6 py-8 mb-6 shadow-lg">
      <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-5">
        Scan to Donate
      </p>

      <div className="w-56 h-56 bg-white rounded-xl p-3 flex items-center justify-center shadow-md">
        <img
          src={donateQR}
          alt="Donation QR Code"
          className="w-full h-full object-contain rounded-lg"
        />
      </div>

      <p className="text-gray-500 text-xs mt-4">
        Point your camera at the QR code to donate
      </p>
    </div>

    {/* Quote Card */}
    <div className="bg-gray-900 border border-gray-800 rounded-2xl px-6 py-5 text-center shadow-lg">
      <span className="text-3xl mb-3 block">💚</span>

      <p className="text-gray-300 text-sm leading-relaxed italic">
        "Every great open-source project started with someone who believed that
        good tools should be free for everyone. Your support keeps that belief
        alive."
      </p>

      <p className="text-gray-600 text-xs mt-3">— The whatsView Team</p>
    </div>
  </PageShell>
);
