import React from "react";
import { GrammarCheck, GrammarError } from "../types";
import { CheckCircle2, AlertTriangle, Eye, ArrowRight, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  originalText: string;
  grammarCheck: GrammarCheck;
  onApplyCorrection: (corrected: string) => void;
}

export const GrammarCheckResults: React.FC<Props> = ({
  originalText,
  grammarCheck,
  onApplyCorrection,
}) => {
  const { correctedText, errors } = grammarCheck;
  const hasErrors = errors.length > 0;

  // Function to create a simple visual diff highlight for the sentence
  const renderInteractiveDiff = () => {
    if (!hasErrors) {
      return (
        <div className="flex items-center gap-3 p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-emerald-800 text-sm md:text-base">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Great writing! No spelling or grammatical errors were detected. Your phrasing is clean.</span>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original with issues */}
          <div className="bg-rose-50/40 border border-rose-100 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Original Text
              </span>
              <span className="text-xs text-rose-500 font-mono">
                {errors.length} issue{errors.length > 1 ? "s" : ""} found
              </span>
            </div>
            <p className="text-slate-700 text-sm font-sans leading-relaxed whitespace-pre-line">
              {originalText}
            </p>
          </div>

          {/* Corrected Text with one-click replace */}
          <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Corrected Text
                </span>
                <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Fully Polished
                </span>
              </div>
              <p className="text-slate-800 text-sm font-sans leading-relaxed whitespace-pre-line">
                {correctedText}
              </p>
            </div>

            {correctedText !== originalText && (
              <button
                onClick={() => onApplyCorrection(correctedText)}
                className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                id="apply-corrected-btn"
              >
                Apply Corrected Version
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getTypeStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case "spelling":
        return {
          bg: "bg-amber-100 text-amber-900 border-amber-200",
          lbl: "Spelling",
          icon: "⚠️",
        };
      case "grammar":
        return {
          bg: "bg-rose-100 text-rose-900 border-rose-200",
          lbl: "Grammar",
          icon: "❌",
        };
      case "punctuation":
        return {
          bg: "bg-blue-100 text-blue-900 border-blue-200",
          lbl: "Punctuation",
          icon: "✏️",
        };
      default:
        return {
          bg: "bg-slate-100 text-slate-800 border-slate-200",
          lbl: "Style",
          icon: "💡",
        };
    }
  };

  return (
    <div className="space-y-6" id="grammar-check-pane">
      {renderInteractiveDiff()}

      {hasErrors && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Specific Errors Detected
          </h4>
          <div className="space-y-3">
            {errors.map((err, i) => {
              const meta = getTypeStyle(err.type);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 bg-white border border-slate-100 rounded-2xl shadow-xs hover:shadow-xs transition-shadow duration-200"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{meta.icon}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${meta.bg}`}>
                        {meta.lbl}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Original
                      </span>
                      <span className="line-through text-rose-600 bg-rose-50/50 px-1.5 py-0.5 rounded text-sm break-all font-sans font-medium">
                        {err.badText || "Empty"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Improvement
                      </span>
                      <span className="text-emerald-700 bg-emerald-50/50 px-1.5 py-0.5 rounded text-sm break-all font-sans font-semibold">
                        {err.goodText || "Omission"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 text-slate-600 text-xs border-t border-slate-50 pt-2 flex items-start gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{err.explanation}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
