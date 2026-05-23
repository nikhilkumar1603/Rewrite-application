import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini client as directed by Gemini API guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Main analytical API endpoint
app.post("/api/analyze", async (req, res) => {
  try {
    const { sentence } = req.body;
    if (!sentence || typeof sentence !== "string" || sentence.trim() === "") {
      return res.status(400).json({ error: "Please provide a valid sentence or paragraph." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "Gemini API Key is not configured. Please add GEMINI_API_KEY to your Secrets database." 
      });
    }

    const systemInstruction = 
      "You are an expert English linguist, copyeditor, and writing coach specializing in academic and professional publications. " +
      "Analyze the user's sentence or paragraph for grammatical correctness, spelling, punctuation, and readability. " +
      "Identify all errors and provide feedback. Then rewrite the input into five distinct expert styles: Academic, Professional, Concise, Eloquent, and Technical. " +
      "Finally, offer structural style improvements such as replacing weak verbs, fixing wordiness, and converting passive voice.";

    const promptObj = `Analyze this text:\n\n"${sentence}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptObj,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["originalSentence", "hasErrors", "grammarCheck", "expertRewrites", "styleSuggestions"],
          properties: {
            originalSentence: {
              type: Type.STRING,
              description: "The original sentence verbatim."
            },
            hasErrors: {
              type: Type.BOOLEAN,
              description: "True if grammatical, punctuation, or spelling errors were found."
            },
            grammarCheck: {
              type: Type.OBJECT,
              required: ["correctedText", "errors"],
              properties: {
                correctedText: {
                  type: Type.STRING,
                  description: "Full grammatically corrected text. If the original had no errors, this is identical to the original."
                },
                errors: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["badText", "goodText", "type", "explanation"],
                    properties: {
                      badText: {
                        type: Type.STRING,
                        description: "The incorrect snippet."
                      },
                      goodText: {
                        type: Type.STRING,
                        description: "The corrected snippet."
                      },
                      type: {
                        type: Type.STRING,
                        description: "Category of error: grammar, spelling, punctuation, style"
                      },
                      explanation: {
                        type: Type.STRING,
                        description: "A short human-friendly explanation of why it was wrong and how to fix it."
                      }
                    }
                  }
                }
              }
            },
            expertRewrites: {
              type: Type.ARRAY,
              description: "Masterful translations of the user's input into standard higher-tier writing levels.",
              items: {
                type: Type.OBJECT,
                required: ["category", "title", "rewrittenText", "whyItWorks", "readingEaseLevel"],
                properties: {
                  category: {
                    type: Type.STRING,
                    description: "Category index: academic, professional, concise, eloquent, technical"
                  },
                  title: {
                    type: Type.STRING,
                    description: "User-friendly label e.g., 'Academic Publication', 'Corporate Executive', 'Clear & Direct', 'Intellectual & Literary', 'Technical Specification'"
                  },
                  rewrittenText: {
                    type: Type.STRING,
                    description: "The rewritten, stylized sentence."
                  },
                  whyItWorks: {
                    type: Type.STRING,
                    description: "Quick commentary on stylistic improvements made (e.g. passive-to-active, word choice)."
                  },
                  readingEaseLevel: {
                    type: Type.STRING,
                    description: "A description of readability index shift (e.g., Graduate level, High clarity professional, Fast-reading direct)."
                  }
                }
              }
            },
            styleSuggestions: {
              type: Type.ARRAY,
              description: "Concrete vocabulary, phrasing, and structural recommendations to boost power and elegance.",
              items: {
                type: Type.OBJECT,
                required: ["aspect", "badText", "goodText", "recommendation"],
                properties: {
                  aspect: {
                    type: Type.STRING,
                    description: "Linguistic element: e.g. Word Choice, Wordiness, Nominalization, Passive Voice, Tone Fit"
                  },
                  badText: {
                    type: Type.STRING,
                    description: "Original subpar phrasing or vocabulary."
                  },
                  goodText: {
                    type: Type.STRING,
                    description: "Suggested powerful alternative."
                  },
                  recommendation: {
                    type: Type.STRING,
                    description: "Why this exchange enhances reading engagement and impact."
                  }
                }
              }
            }
          }
        }
      }
    });

    const textResult = response.text || "";
    try {
      const data = JSON.parse(textResult.trim());
      res.json(data);
    } catch (parseError) {
      console.error("Failed to parse JSON result from Gemini:", textResult);
      res.status(500).json({ 
        error: "Failed to parse analysis result. Please try again.",
        rawText: textResult
      });
    }
  } catch (error: any) {
    console.error("API error during text analysis:", error);
    res.status(500).json({ error: error.message || "An error occurred while analyzing the sentence." });
  }
});

// Setup Vite Development Middleware or Production Static Serve
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server listening on http://0.0.0.0:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
