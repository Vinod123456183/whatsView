import React from "react";
import { IoMail, IoLogoGithub, IoLogoLinkedin } from "react-icons/io5";
import { IoChevronForward } from "react-icons/io5";
import { PageShell } from "./PageShell";

const LINKS = [
  {
    icon: <IoMail size={20} color="#25D366" />,
    label: "Email",
    display: "winn.od143.166@gmail.com",
    href: "mailto:winn.od143.166@gmail.com",
  },
  {
    icon: <IoLogoGithub size={20} color="#25D366" />,
    label: "GitHub",
    display: "github.com/Vinod123456183",
    href: "https://github.com/Vinod123456183",
  },
  {
    icon: <IoLogoLinkedin size={20} color="#25D366" />,
    label: "LinkedIn",
    display: "linkedin.com/in/vinod-barti-339571268/",
    href: "https://www.linkedin.com/in/vinod-barti-339571268/",
  },
];

export const ContactPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <PageShell title="Contact Us" onBack={onBack}>
    {/* Hero */}
    <div className="flex flex-col items-center text-center mb-8">
      <div className="w-16 h-16 rounded-full bg-[#128C7E] flex items-center justify-center mb-4">
        <IoMail size={32} color="white" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Get in Touch</h1>
      <p className="text-gray-400 text-sm leading-relaxed">
        Bug report, feature request, or just want to say hi? Reach us through
        any of the channels below.
      </p>
    </div>

    {/* Contact cards */}
    <div className="flex flex-col gap-3">
      {LINKS.map(({ icon, label, display, href }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith("mailto") ? undefined : "_blank"}
          rel="noreferrer"
          className="flex items-center gap-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-[#25D366] rounded-2xl px-5 py-4 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              {label}
            </span>
            <span className="text-white font-medium group-hover:text-[#25D366] transition-colors">
              {display}
            </span>
          </div>
          <IoChevronForward
            size={18}
            className="ml-auto text-gray-600 group-hover:text-[#25D366] transition-colors"
          />
        </a>
      ))}
    </div>
  </PageShell>
);
