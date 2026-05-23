export interface ExamplePhrase {
  id: string;
  category: "Academic Draft" | "Corporate Draft" | "Colloquial Draft" | "Wordy Draft";
  previewText: string;
  fullText: string;
  description: string;
}

export const samplePhrases: ExamplePhrase[] = [
  {
    id: "ex-1",
    category: "Academic Draft",
    previewText: "We wanted to see if the drug works, so we did a lot of experiments on mice.",
    fullText: "We wanted to see if the drug works, so we did a lot of experiments on mice and we found out it did in most cases.",
    description: "Informal, active first-person phrasing unsuitable for scientific publication."
  },
  {
    id: "ex-2",
    category: "Corporate Draft",
    previewText: "I'm writing to tell you that we can't do the meeting tomorrow because I have too much stuff to do.",
    fullText: "I'm writing to tell you that we can't do the meeting tomorrow because I have too much stuff to do today and need to finish a report.",
    description: "Overly informal scheduling notice with passive word choice."
  },
  {
    id: "ex-3",
    category: "Colloquial Draft",
    previewText: "This website has a ton of cool stuff but it is kind of slow and annoying to deal with.",
    fullText: "This website has a ton of cool stuff but it is kind of slow and annoying to deal with when you try to buy something on your phone.",
    description: "Vague, subjective, and overly conversational prose."
  },
  {
    id: "ex-4",
    category: "Wordy Draft",
    previewText: "Due to the fact that there is a lack of financial availability, we should make a decision regarding...",
    fullText: "Due to the fact that there is a lack of financial availability in our current budget, we should make a decision regarding cutting down on our spending.",
    description: "Highly redundant, verbose phrasing with nominalizations."
  }
];
