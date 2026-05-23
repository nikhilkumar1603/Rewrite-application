import React, { useState } from "react";
import { ExpertRewrite } from "../types";
import { 
  Copy, 
  Check, 
  Bookmark, 
  BookmarkCheck, 
  BookOpen, 
  Send, 
  Sparkles, 
  Compass, 
  TrendingUp, 
  Terminal,
  Clock
} from "lucide-react";
import { motion } from "motion/react";

interface Props {
  rewrite: ExpertRewrite;
  isSaved: boolean;
  onToggleSave: () => void;
}

export const RewriteCard: React.FC<Props> = ({ rewrite, isSaved, onToggleSave }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rewrite.rewrittenText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const getStyleTheme = (category: string) => {
    switch (category.toLowerCase()) {
      case "academic":
        return {
          icon: <BookOpen className="w-4 h-4 text-indigo-600" />,
          bg: "bg-indigo-50 text-indigo-700",
          cardBorder: "hover:border-indigo-200 border-slate-100",
          headlineColor: "text-indigo-900",
          accentLine: "bg-indigo-600",
          desc: "Scholarly publication draft"
        };
      case "professional":
        return {
          icon: <Send className="w-4 h-4 text-violet-600" />,
          bg: "bg-violet-50 text-violet-700",
          cardBorder: "hover:border-violet-200 border-slate-100",
          headlineColor: "text-violet-900",
          accentLine: "bg-violet-600",
          desc: "Executive or client email style"
        };
      case "concise":
        return {
          icon: <Clock className="w-4 h-4 text-emerald-600" />,
          bg: "bg-emerald-50 text-emerald-700",
          cardBorder: "hover:border-emerald-200 border-slate-100",
          headlineColor: "text-emerald-900",
          accentLine: "bg-emerald-600",
          desc: "High clarity, minimal word count"
        };
      case "eloquent":
        return {
          icon: <Sparkles className="w-4 h-4 text-amber-600" />,
          bg: "bg-amber-50 text-amber-700",
          cardBorder: "hover:border-amber-200 border-slate-100",
          headlineColor: "text-amber-900",
          accentLine: "bg-amber-600",
          desc: "Elegant and persuasive prose"
        };
      case "technical":
        return {
          icon: <Terminal className="w-4 h-4 text-sky-600" />,
          bg: "bg-sky-50 text-sky-700",
          cardBorder: "hover:border-sky-200 border-slate-100",
          headlineColor: "text-sky-900",
          accentLine: "bg-sky-600",
          desc: "Precise engineering or product specifications"
        };
      default:
        return {
          icon: <Compass className="w-4 h-4 text-slate-600" />,
          bg: "bg-slate-50 text-slate-700",
          cardBorder: "hover:border-slate-200 border-slate-100",
          headlineColor: "text-slate-900",
          accentLine: "bg-slate-600",
          desc: "General variation"
        };
    }
  };

  const theme = getStyleTheme(rewrite.category);

  return (
    <div 
      className={`relative bg-white border ${theme.cardBorder} rounded-3xl p-5 md:p-6 shadow-xs hover:shadow-xs transition-all duration-300 flex flex-col justify-between`}
      id={`rewrite-card-${rewrite.category}`}
    >
      {/* Small top accent bar */}
      <div className={`absolute top-0 inset-x-0 h-1.5 rounded-t-3xl ${theme.accentLine}`} />
      
      <div>
        {/* Card Header information */}
        <div className="flex items-center justify-between xl:gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${theme.bg}`}>
              {theme.icon}
            </div>
            <div>
              <h3 className={`text-sm font-semibold tracking-tight ${theme.headlineColor}`}>
                {rewrite.title}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                {theme.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 backdrop-blur-xs bg-slate-50/70 border border-slate-100 py-1 px-2.5 rounded-full select-none">
            <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              {rewrite.readingEaseLevel}
            </span>
          </div>
        </div>

        {/* Rewritten Target Block */}
        <div className="relative group/rewrite bg-slate-50/50 border border-slate-100 p-4 rounded-2xl min-h-[4rem] flex flex-col justify-center">
          <p className="text-slate-800 text-sm md:text-base font-sans font-medium leading-relaxed font-sans pr-4 break-words">
            {rewrite.rewrittenText}
          </p>
        </div>

        {/* Analytical Style why-it-works block */}
        <div className="mt-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            Rhetorical Shift & Style Notes
          </h4>
          <p className="text-slate-500 text-xs leading-relaxed font-sans">
            {rewrite.whyItWorks}
          </p>
        </div>
      </div>

      {/* Footer controls */}
      <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between gap-3">
        <button
          onClick={onToggleSave}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl border text-[11px] font-medium transition-colors duration-200 uppercase tracking-wider cursor-pointer ${
            isSaved
              ? "bg-slate-100 text-amber-700 border-amber-200"
              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700"
          }`}
          title={isSaved ? "Saved to Favorites" : "Save to Favorites"}
        >
          {isSaved ? (
            <>
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              Saved
            </>
          ) : (
            <>
              <Bookmark className="w-3.5 h-3.5 text-slate-400" />
              Bookmark
            </>
          )}
        </button>

        <button
          onClick={handleCopy}
          className={`sm:px-3 px-2 py-1.5 rounded-xl text-[11px] font-medium transition-all duration-200 flex items-center gap-1.5 uppercase tracking-wider cursor-pointer border ${
            copied
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-900 border-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
};
