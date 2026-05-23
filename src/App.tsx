import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  BookOpen, 
  Briefcase, 
  Clock, 
  BookMarked, 
  History, 
  Trash2, 
  Copy, 
  Check, 
  Loader2, 
  Smartphone, 
  Monitor, 
  Wand2, 
  Eraser, 
  ArrowRight, 
  CornerDownLeft, 
  HelpCircle,
  ThumbsUp,
  Info,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { samplePhrases, ExamplePhrase } from "./data/examples";
import { AnalysisResponse, HistoryItem, SavedRewrite, ExpertRewrite } from "./types";
import { GrammarCheckResults } from "./components/GrammarCheckResults";
import { RewriteCard } from "./components/RewriteCard";
import { StyleSuggestions } from "./components/StyleSuggestions";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Application View Mode: "phone" (simulated Android frame) vs "desktop" (full spacious layout)
  const [viewMode, setViewMode] = useState<"phone" | "desktop">("phone");
  
  // Tab within the analysis results (for phone mode optimization or tabbed desktop reading)
  const [activeResultTab, setActiveResultTab] = useState<"rewrites" | "grammar" | "style">("rewrites");

  // User input states
  const [inputText, setInputText] = useState("");
  const [charCount, setCharCount] = useState(0);

  // API Call States
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);

  // Sidebar / Auxiliary list states
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [savedRewrites, setSavedRewrites] = useState<SavedRewrite[]>([]);
  const [activeSideTab, setActiveSideTab] = useState<"examples" | "history" | "favorites">("examples");

  // Shared copy feedback 
  const [globalCopiedText, setGlobalCopiedText] = useState<string | null>(null);

  // Initialize and load persistent data from localStorage securely
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("srt_sentence_history");
      if (storedHistory) {
        setHistoryList(JSON.parse(storedHistory));
      }
      const storedFavorites = localStorage.getItem("srt_saved_rewrites");
      if (storedFavorites) {
        setSavedRewrites(JSON.parse(storedFavorites));
      }
    } catch (e) {
      console.error("Local storage restoration failed:", e);
    }
  }, []);

  // Update input helper
  const handleInputChange = (text: string) => {
    setInputText(text);
    setCharCount(text.trim().length);
    if (errorText) setErrorText(null);
  };

  // Trigger content analysis
  const handleAnalyzeText = async (targetText: string) => {
    const trimmed = targetText.trim();
    if (!trimmed) {
      setErrorText("Please write or paste a phrase to enhance.");
      return;
    }

    setIsLoading(true);
    setErrorText(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sentence: trimmed }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status} - Server responded with an error.`);
      }

      const parsedData: AnalysisResponse = await response.json();
      setAnalysisResult(parsedData);
      
      // Select the first tab to showcase outputs
      setActiveResultTab("rewrites");

      // Save to History state & persist
      const newHistoryItem: HistoryItem = {
        id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        originalText: trimmed,
        analytics: parsedData,
      };

      const updatedHistory = [newHistoryItem, ...historyList].slice(0, 30); // limit to 30
      setHistoryList(updatedHistory);
      localStorage.setItem("srt_sentence_history", JSON.stringify(updatedHistory));

    } catch (err: any) {
      console.error("Analysis invocation failed:", err);
      setErrorText(err.message || "Failed to establish database connection with service. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Action: Clear App Content states
  const handleClearAll = () => {
    setInputText("");
    setCharCount(0);
    setErrorText(null);
    setAnalysisResult(null);
  };

  // Quick Action: Select an interactive example phrase
  const handleSelectExample = (ex: ExamplePhrase) => {
    handleInputChange(ex.fullText);
    setErrorText(null);
  };

  // Bookmark toggling handler to collect favorites
  const handleToggleSaveRewrite = (rewrite: ExpertRewrite, original: string) => {
    const isAlreadySaved = savedRewrites.some(
      (s) => s.originalText === original && s.category === rewrite.category
    );

    let updatedFavorites: SavedRewrite[] = [];

    if (isAlreadySaved) {
      updatedFavorites = savedRewrites.filter(
        (s) => !(s.originalText === original && s.category === rewrite.category)
      );
    } else {
      const newItem: SavedRewrite = {
        id: `fav-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        originalText: original,
        category: rewrite.category,
        title: rewrite.title,
        rewrittenText: rewrite.rewrittenText,
        timestamp: Date.now(),
      };
      updatedFavorites = [newItem, ...savedRewrites];
    }

    setSavedRewrites(updatedFavorites);
    localStorage.setItem("srt_saved_rewrites", JSON.stringify(updatedFavorites));
  };

  // Quick Action: Delete custom history record
  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = historyList.filter((item) => item.id !== id);
    setHistoryList(filtered);
    localStorage.setItem("srt_sentence_history", JSON.stringify(filtered));
  };

  // Quick Action: Clear all recorded history
  const handleClearHistory = () => {
    setHistoryList([]);
    localStorage.removeItem("srt_sentence_history");
  };

  // Quick Action: Copy static text snippet with UI notification
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setGlobalCopiedText(text);
    setTimeout(() => setGlobalCopiedText(null), 2000);
  };

  // Apply grammatical correction back to editable box
  const handleApplyCorrectionToInput = (correctedText: string) => {
    handleInputChange(correctedText);
  };

  // Main UI render logic splits here to keep codebase modular
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 pb-12" id="applet-container">
      {/* Visual Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-sm text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5 font-sans">
                AuraWrite <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-full uppercase tracking-wider">Expert</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">Academic & Professional Eloquence Engine</p>
            </div>
          </div>

          {/* Interactive controls: Frame View Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-3 font-medium">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/50">
              <button
                onClick={() => setViewMode("phone")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  viewMode === "phone"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                id="viewmode-android"
              >
                <Smartphone className="w-3.5 h-3.5" />
                Android Shell
              </button>
              <button
                onClick={() => setViewMode("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  viewMode === "desktop"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                id="viewmode-desktop"
              >
                <Monitor className="w-3.5 h-3.5" />
                Spacious Full
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        
        {/* VIEW 1: Android Simulated Frame View */}
        {viewMode === "phone" && (
          <div className="flex justify-center items-start pt-2 pb-10" id="android-mode-wrapper">
            {/* The Physical Simulated Phone Wrapper */}
            <div className="relative w-full max-w-[430px] bg-slate-950 rounded-[52px] p-4.5 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700/50">
              
              {/* Phone Speaker & Camera Cutout Spacer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-6 w-36 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
                <div className="w-12 h-1 bg-slate-800 rounded-full" />
                <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-800" />
              </div>

              {/* Volume/Power Buttons decoration */}
              <div className="absolute left-[-6px] top-32 w-1.5 h-12 bg-slate-800 rounded-sm" />
              <div className="absolute left-[-6px] top-48 w-1.5 h-16 bg-slate-800 rounded-sm" />
              <div className="absolute right-[-6px] top-40 w-1.5 h-20 bg-slate-800 rounded-sm" />

              {/* Inner screen glass container */}
              <div className="bg-slate-50 w-full min-h-[780px] rounded-[40px] overflow-hidden flex flex-col border border-slate-900 relative">
                
                {/* Simulated Android Status Bar */}
                <div className="bg-white px-6 pt-5 pb-2 text-slate-700 font-mono text-[11px] font-bold flex justify-between items-center selection:bg-slate-200">
                  <span>9:41 AM</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-sans tracking-tight">5G</span>
                    <div className="w-5 h-2.5 border border-slate-400 rounded-sm p-0.5 flex">
                      <div className="h-full w-full bg-slate-700 rounded-2xs" />
                    </div>
                  </div>
                </div>

                {/* Android App Title Area */}
                <div className="bg-white border-b border-slate-100 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      A
                    </div>
                    <div>
                      <h2 className="text-xs font-extrabold text-slate-900 tracking-tight">AuraWrite Android</h2>
                      <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider leading-none">v1.2 Production</p>
                    </div>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Connected to Google Gemini AI" />
                </div>

                {/* Scrollable Android body area */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-h-[640px] scroll-smooth">
                  
                  {/* Informative Help Guide Card */}
                  <div className="bg-linear-to-br from-indigo-900 to-indigo-950 p-4.5 rounded-3xl text-white shadow-xs">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-200">Expert Rewrite Engine</h3>
                    </div>
                    <p className="text-slate-100 text-xs leading-relaxed font-light">
                      Input your sentence or draft below. Our integrated linguistics network checks your grammar and outputs high-tier academic and professional versions instantly.
                    </p>
                  </div>

                  {/* Android Input Area */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Original Phrase
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium font-mono">
                        {inputText.length} chars
                      </span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-inner">
                      <textarea
                        value={inputText}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder="Type, write or paste your sentence/paragraph here... (e.g. 'We wanted to see if the drug works, so we did a lot of experiments on mice.')"
                        className="w-full h-24 bg-transparent outline-hidden border-hidden resize-none text-slate-800 text-xs font-medium leading-relaxed font-sans placeholder:text-slate-300"
                        maxLength={800}
                      />
                      
                      <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between">
                        <button
                          onClick={handleClearAll}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          <Eraser className="w-3.5 h-3.5" />
                          Clear
                        </button>

                        <button
                          onClick={() => handleAnalyzeText(inputText)}
                          disabled={isLoading || inputText.trim() === ""}
                          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
                            isLoading || inputText.trim() === ""
                              ? "bg-slate-100 text-slate-300 border border-slate-100 cursor-not-allowed"
                              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                          }`}
                          id="android-analyze-btn"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Polishing...
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-3.5 h-3.5" />
                              Rewrite
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Error Message */}
                  {errorText && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3.5 bg-rose-50 text-rose-800 border border-rose-100 rounded-2xl text-[11px] leading-relaxed font-sans font-medium flex gap-2"
                    >
                      <Info className="w-4 h-4 text-rose-600 shrink-0" />
                      <div>
                        <span className="font-bold">Error:</span> {errorText}
                      </div>
                    </motion.div>
                  )}

                  {/* Android Quick Presets Helper */}
                  {!analysisResult && !isLoading && (
                    <div className="space-y-2 pt-1 border-t border-slate-200/50">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Tap practice drafts</span>
                        <span className="text-[9px] font-semibold text-indigo-500">Pick below</span>
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {samplePhrases.map((ex) => (
                          <button
                            key={ex.id}
                            onClick={() => handleSelectExample(ex)}
                            className="bg-white hover:bg-slate-100 text-left p-3 rounded-2xl border border-slate-100 transition-colors duration-150 cursor-pointer text-xs"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {ex.category}
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                            <p className="text-slate-600 font-sans italic line-clamp-2">
                              "{ex.previewText}"
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Simulated Core Android Output Dashboard */}
                  {(analysisResult || isLoading) && (
                    <div className="space-y-4 pt-1 border-t border-slate-200/50" id="android-results">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Analysis Dashboard
                        </span>
                        
                        {isLoading && (
                          <span className="text-[10px] text-indigo-600 font-semibold animate-pulse flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Syncing with linguistics server...
                          </span>
                        )}
                      </div>

                      {/* Loading Skeletal State */}
                      {isLoading && (
                        <div className="space-y-3 bg-white border border-slate-100 p-4 rounded-3xl animate-pulse">
                          <div className="h-4 bg-slate-200 rounded-full w-2/3" />
                          <div className="h-3 bg-slate-100 rounded-full w-full" />
                          <div className="h-3 bg-slate-100 rounded-full w-5/6" />
                          <div className="h-10 bg-slate-100 rounded-2xl w-full mt-4" />
                        </div>
                      )}

                      {/* Live Processed Interactive Output Panels */}
                      {analysisResult && !isLoading && (
                        <div className="space-y-4">
                          
                          {/* Segmented control bar in Android */}
                          <div className="flex border-b border-slate-100 bg-slate-100 p-1 rounded-2xl">
                            <button
                              onClick={() => setActiveResultTab("rewrites")}
                              className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                activeResultTab === "rewrites"
                                  ? "bg-white text-indigo-900 shadow-3xs"
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              Expert Styles
                            </button>
                            <button
                              onClick={() => setActiveResultTab("grammar")}
                              className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                activeResultTab === "grammar"
                                  ? "bg-white text-indigo-900 shadow-3xs"
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              Grammar
                            </button>
                            <button
                              onClick={() => setActiveResultTab("style")}
                              className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                activeResultTab === "style"
                                  ? "bg-white text-indigo-900 shadow-3xs"
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              Style
                            </button>
                          </div>

                          {/* Dynamic Active Tab panels inside Android View config */}
                          <div>
                            {activeResultTab === "rewrites" && (
                              <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Generated Expert Variations
                                </h4>
                                <div className="space-y-3">
                                  {analysisResult.expertRewrites.map((rew, idx) => {
                                    const isSaved = savedRewrites.some(
                                      (s) => s.originalText === analysisResult.originalSentence && s.category === rew.category
                                    );
                                    return (
                                      <RewriteCard
                                        key={idx}
                                        rewrite={rew}
                                        isSaved={isSaved}
                                        onToggleSave={() => handleToggleSaveRewrite(rew, analysisResult.originalSentence)}
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {activeResultTab === "grammar" && (
                              <GrammarCheckResults
                                originalText={analysisResult.originalSentence}
                                grammarCheck={analysisResult.grammarCheck}
                                onApplyCorrection={handleApplyCorrectionToInput}
                              />
                            )}

                            {activeResultTab === "style" && (
                              <StyleSuggestions suggestions={analysisResult.styleSuggestions} />
                            )}
                          </div>

                        </div>
                      )}
                    </div>
                  )}

                  {/* Auxiliary Saved Favorite Bookmarks in Android */}
                  {savedRewrites.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-slate-200/50">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <BookMarked className="w-3.5 h-3.5 text-amber-500" />
                          Bookmarks ({savedRewrites.length})
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {savedRewrites.slice(0, 3).map((item) => (
                          <div key={item.id} className="bg-white p-3 rounded-2xl border border-slate-100 text-xs">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                                {item.title}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">
                                {new Date(item.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-700 font-medium font-sans mb-1.5">"{item.rewrittenText}"</p>
                            <button
                              onClick={() => handleCopyText(item.rewrittenText)}
                              className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" /> Copy Phrasing
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Simulated Android Home Indicator Strip bottom */}
                <div className="bg-white px-6 pb-4 pt-1 flex justify-center items-center select-none">
                  <div className="w-32 h-1 bg-slate-300 rounded-full" />
                </div>

              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Spacious Desktop View Layout */}
        {viewMode === "desktop" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in" id="desktop-mode-wrapper">
            
            {/* Left Hand: Controls, Selection and History Pane */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Main Sentence Creator Input */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    Original Text Block
                  </label>
                  <span className="text-xs text-slate-400 font-semibold font-mono bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-100">
                    {charCount} / 800 characters
                  </span>
                </div>

                <textarea
                  value={inputText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Type, write or paste your draft paragraph here..."
                  className="w-full h-36 bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-slate-800 text-sm md:text-base font-medium leading-relaxed font-sans placeholder:text-slate-300 focus:outline-hidden focus:border-indigo-400 focus:bg-white transition-all shadow-inner"
                  maxLength={800}
                />

                <div className="mt-4 flex items-center justify-between gap-3">
                  <button
                    onClick={handleClearAll}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Eraser className="w-4 h-4" />
                    Clear text
                  </button>

                  <button
                    onClick={() => handleAnalyzeText(inputText)}
                    disabled={isLoading || inputText.trim() === ""}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
                      isLoading || inputText.trim() === ""
                        ? "bg-slate-100 text-slate-300 border border-slate-100 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-98"
                    }`}
                    id="desktop-analyze-btn"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Polishing Prose...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        Rewrite Sentence
                      </>
                    )}
                  </button>
                </div>

                {errorText && (
                  <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-medium text-rose-800 flex items-start gap-2.5">
                    <Info className="w-4.5 h-4.5 text-rose-600 shrink-0" />
                    <span className="leading-relaxed">{errorText}</span>
                  </div>
                )}
              </div>

              {/* Sidebar Tabs (Preset Examples, History and Favorited Bookmarks) */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                {/* Tabs bar */}
                <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
                  <button
                    onClick={() => setActiveSideTab("examples")}
                    className={`flex-1 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide rounded-xl transition-all cursor-pointer ${
                      activeSideTab === "examples"
                        ? "bg-white text-indigo-900 border border-slate-100 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Drafts
                  </button>
                  <button
                    onClick={() => setActiveSideTab("history")}
                    className={`flex-1 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide rounded-xl transition-all cursor-pointer ${
                      activeSideTab === "history"
                        ? "bg-white text-indigo-900 border border-slate-100 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    History ({historyList.length})
                  </button>
                  <button
                    onClick={() => setActiveSideTab("favorites")}
                    className={`flex-1 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide rounded-xl transition-all cursor-pointer ${
                      activeSideTab === "favorites"
                        ? "bg-white text-indigo-900 border border-slate-100 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Saved ({savedRewrites.length})
                  </button>
                </div>

                {/* Tab content renders below */}
                <div className="p-5 max-h-[380px] overflow-y-auto">
                  
                  {/* TAB: Sample Draft Examples */}
                  {activeSideTab === "examples" && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Choose a study prototype</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">Select a subpar raw draft below to demonstrate formatting improvements.</p>
                      </div>
                      
                      <div className="space-y-3">
                        {samplePhrases.map((ex) => (
                          <div 
                            key={ex.id}
                            onClick={() => handleSelectExample(ex)}
                            className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 hover:border-indigo-100 rounded-2xl cursor-pointer transition-all duration-150 text-xs text-left group"
                          >
                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-md uppercase tracking-wider mb-2 inline-block">
                              {ex.category}
                            </span>
                            <p className="text-slate-700 italic font-sans mb-1 mt-0.5 line-clamp-2">
                              "{ex.previewText}"
                            </p>
                            <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                              Load prototype <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB: Personal Workspace History list */}
                  {activeSideTab === "history" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">Previous Analyses</h4>
                          <p className="text-[11px] text-slate-400">Your recent enhanced texts</p>
                        </div>
                        {historyList.length > 0 && (
                          <button
                            onClick={handleClearHistory}
                            className="text-[10px] text-slate-400 hover:text-rose-600 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Clear All
                          </button>
                        )}
                      </div>

                      {historyList.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs font-sans">
                          Nothing processed in this session.
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {historyList.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => {
                                setAnalysisResult(item.analytics);
                                setInputText(item.originalText);
                              }}
                              className="p-3.5 bg-slate-50/50 hover:bg-indigo-50/20 border border-slate-100 hover:border-slate-200 rounded-2xl cursor-pointer text-xs relative group transition-all"
                            >
                              <div className="flex justify-between items-center mb-1 pr-6">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-slate-600 font-medium font-sans italic truncate">
                                "{item.originalText}"
                              </p>
                              <button
                                onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                                className="absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: Favorited saved rewrites list */}
                  {activeSideTab === "favorites" && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Saved Expert Cards</h4>
                        <p className="text-[11px] text-slate-400">High-tier bookmarked phrases</p>
                      </div>

                      {savedRewrites.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs font-sans">
                          No saved rewrites yet. Bookmarks will appear here.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {savedRewrites.map((fav) => (
                            <div key={fav.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-3xs relative group text-xs">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  {fav.title}
                                </span>
                                <button
                                  onClick={() => handleCopyText(fav.rewrittenText)}
                                  className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                                >
                                  <Copy className="w-3 h-3" /> Copy
                                </button>
                              </div>
                              <p className="text-slate-800 font-semibold font-sans mb-2">"{fav.rewrittenText}"</p>
                              <div className="border-t border-slate-50 pt-2 text-[10px] text-slate-400 font-sans line-clamp-2">
                                <span className="font-bold">Original:</span> "{fav.originalText}"
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

            </div>

            {/* Right Hand: Deep Analysis Dashboard Output */}
            <div className="lg:col-span-8 space-y-6">

              {/* Loader skeletal state */}
              {isLoading && (
                <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-xs min-h-[500px] flex flex-col justify-center items-center">
                  <div className="p-5 bg-indigo-50 text-indigo-600 rounded-full animate-spin">
                    <Loader2 className="w-8 h-8" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-bold text-slate-800 text-lg">Polishing Sentence Structure</h3>
                    <p className="text-slate-400 text-xs max-w-sm">Generating academic transformations and testing grammatical constructs with Gemini artificial intelligence model...</p>
                  </div>
                  
                  <div className="w-full max-w-md bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full animate-[shimmer_1.5s_infinite]" style={{ width: '60%' }} />
                  </div>
                </div>
              )}

              {/* Standby Empty Showcase Screen */}
              {!analysisResult && !isLoading && (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs min-h-[500px] flex flex-col justify-center items-center">
                  <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 mb-4 shadow-3xs">
                    <Wand2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-slate-800 font-extrabold text-lg tracking-tight">Prose Optimizer Hub</h3>
                  <p className="text-slate-400 text-xs mt-1.5 max-w-md leading-relaxed">
                    Ready to raise your writing index. Select a prototype or input sentences in the creator pane, then click <span className="font-bold text-indigo-600">"Rewrite Sentence"</span> to explore five expert styles!
                  </p>
                </div>
              )}

              {/* Render Full analysis Result Tabs */}
              {analysisResult && !isLoading && (
                <div className="space-y-6" id="analytics-deck">
                  
                  {/* Visual Analysis Highlights Info box */}
                  <div className="bg-linear-to-br from-slate-900 to-slate-950 p-6 rounded-3xl text-white shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest pl-0.5">
                        Target Phrase Analyzed
                      </span>
                      <p className="font-sans italic text-sm text-slate-200 line-clamp-2 leading-relaxed">
                        "{analysisResult.originalSentence}"
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 bg-white/10 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-xs">
                      <ThumbsUp className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-bold">Linguistics index</span>
                        <span className="text-xs text-white font-bold">Optimized Output Ready</span>
                      </div>
                    </div>
                  </div>

                  {/* Section: Grammar Checking with diff */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="bg-rose-100 text-rose-800 p-1 rounded-lg">
                        <Check className="w-4 h-4" />
                      </span>
                      Integrated Grammar & Correction Engine
                    </h3>
                    
                    <GrammarCheckResults 
                      originalText={analysisResult.originalSentence}
                      grammarCheck={analysisResult.grammarCheck}
                      onApplyCorrection={handleApplyCorrectionToInput}
                    />
                  </div>

                  {/* Section: Five Professional Rewrites Grid */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-2">
                      <span className="bg-indigo-100 text-indigo-800 p-1 rounded-lg">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      Expert Translation Output (Five Specialized Styles)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysisResult.expertRewrites.map((rew, idx) => {
                        const isSaved = savedRewrites.some(
                          (s) => s.originalText === analysisResult.originalSentence && s.category === rew.category
                        );
                        return (
                          <RewriteCard
                            key={idx}
                            rewrite={rew}
                            isSaved={isSaved}
                            onToggleSave={() => handleToggleSaveRewrite(rew, analysisResult.originalSentence)}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Section: Better sentences for improved readability & style */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="bg-violet-100 text-violet-800 p-1 rounded-lg">
                        <BookOpen className="w-4 h-4" />
                      </span>
                      Reader Vocabulary & Stylistic Adjustments
                    </h3>

                    <StyleSuggestions suggestions={analysisResult.styleSuggestions} />
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* Persistent global mini clipboard overlay notification */}
      <AnimatePresence>
        {globalCopiedText !== null && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-slate-900 text-white text-xs font-extrabold py-3 px-5 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-2 z-50 uppercase tracking-wider pl-4"
          >
            <Check className="text-emerald-400 w-4 h-4 shrink-0" />
            Active phrasing copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
