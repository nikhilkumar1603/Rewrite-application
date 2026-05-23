import React from "react";
import { StyleSuggestion } from "../types";
import { Sparkles, ArrowRight, BookOpen, AlertCircle } from "lucide-react";

interface Props {
  suggestions: StyleSuggestion[];
}

export const StyleSuggestions: React.FC<Props> = ({ suggestions }) => {
  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 border border-slate-100 rounded-3xl text-center">
        <div className="p-3 bg-white rounded-2xl shadow-xs text-indigo-500 mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h4 className="font-semibold text-slate-800 text-sm">Flawless Style & Flow</h4>
        <p className="text-slate-500 text-xs mt-1 max-w-sm">
          No stylistic nominalizations, wordiness, or weak words detected. Your sentence structure is highly optimized!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" id="style-suggestions-pane">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          Style & Readability Adjustments
        </h4>
        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
          {suggestions.length} proposal{suggestions.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {suggestions.map((sug, i) => (
          <div 
            key={i} 
            className="p-5 bg-white border border-slate-100 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-4"
          >
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                  {sug.aspect}
                </span>
              </div>

              {/* Phrasing comparison */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 bg-slate-50/30 p-2.5 rounded-2xl border border-slate-50">
                <div className="flex-1 bg-white p-3 border border-slate-100 rounded-xl">
                  <span className="text-[9px] font-bold text-rose-500 block mb-1 uppercase tracking-wide">
                    Weak / Wordy Phrasing
                  </span>
                  <p className="text-slate-600 text-xs font-medium italic">
                    "{sug.badText}"
                  </p>
                </div>
                
                <div className="flex shrink-0 justify-center items-center">
                  <ArrowRight className="w-5 h-5 text-slate-300 transform rotate-90 sm:rotate-0" />
                </div>

                <div className="flex-1 bg-white p-3 border border-emerald-100 rounded-xl">
                  <span className="text-[9px] font-bold text-emerald-600 block mb-1 uppercase tracking-wide">
                    Smarter / Stronger Choice
                  </span>
                  <p className="text-slate-800 text-xs font-semibold">
                    "{sug.goodText}"
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-1.5 text-xs text-slate-500 pt-1">
                <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-sans mt-px">
                  {sug.recommendation}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
