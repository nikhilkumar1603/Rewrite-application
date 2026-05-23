export interface GrammarError {
  badText: string;
  goodText: string;
  type: string; // "grammar" | "spelling" | "punctuation" | "style"
  explanation: string;
}

export interface GrammarCheck {
  correctedText: string;
  errors: GrammarError[];
}

export interface ExpertRewrite {
  category: string; // "academic" | "professional" | "concise" | "eloquent" | "technical"
  title: string;
  rewrittenText: string;
  whyItWorks: string;
  readingEaseLevel: string;
}

export interface StyleSuggestion {
  aspect: string;
  badText: string;
  goodText: string;
  recommendation: string;
}

export interface AnalysisResponse {
  originalSentence: string;
  hasErrors: boolean;
  grammarCheck: GrammarCheck;
  expertRewrites: ExpertRewrite[];
  styleSuggestions: StyleSuggestion[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  originalText: string;
  analytics: AnalysisResponse;
}

export interface SavedRewrite {
  id: string;
  originalText: string;
  category: string;
  title: string;
  rewrittenText: string;
  timestamp: number;
}
