import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const aiSummarise = async (diff: string) => {
  try {
    const res = await model.generateContent([
      `You are an expert programmer, and you are trying to summarize a git diff.
Reminders about the git diff format:
For every file, there are a few metadata lines, like (for example):
\`\`\`
diff --git a/lib/index.js b/lib/index.js
index aadf691..bfef603 100644
--- a/lib/index.js
+++ b/lib/index.js
\`\`\`
This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.
Then there is a specifier of the lines that were modified.
A line starting with \`+\` means it was added.
A line that starting with \`-\` means that line was deleted.
A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.
It is not part of the diff.
[...]
EXAMPLE SUMMARY COMMENTS:
\`\`\`
* Raised the amount of returned recordings from \`10\` to \`100\`  [packages/server/recordings_api.ts, packages/server/constants.ts]
* Fixed a typo in the github action name [github/workflows/gpt-commit-summarizer.yml]
* Moved the \`octokit\` initialization to a separate file [src/octokit.ts, src/index.ts]
* Added an OpenAI API for completions [packages/utils/apis/openai.ts]
* Lowered numeric tolerance for test files
\`\`\`
Most commits will have less comments than this examples list.
The last comment does not include the file names, because there were more than two relevant files in the hypothetical commit.
Only include file names if there are two or less files that were modified.
Do not include parts of the example in your summary.
It is given only as an example of appropriate comments.`,
      `Please summarise the following diff file: \n\n${diff}`,
    ]);

    return res.response.text();
  } catch (error) {
    console.error(error);
    return "Rate limited response since i am using a free tier";
  }
};

export const summariseCode = async (doc: Document) => {
  try {
    const code = doc.pageContent.slice(0, 10000); // Limiting to 10k characters
    const res = await model.generateContent([
      `You are an intelligent senior software engineer who specializes in onboarding junior software engineers onto projects.`,
      `You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file.
      Here is the code:
      ----
      ${code}
      ----
      Give a summary no more than 100 words of the code above`,
    ]);
    return res.response.text();
  } catch (error) {
    console.error(error);
    return "Rate limited response since i am using a free tier";
  }
};

export const generateEmbedding = async (summary: string) => {
  const embeddingModel = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });
  // Embed the summary
  const result = await embeddingModel.embedContent(summary);
  const embedding = result.embedding;
  // Return the embedding - a vector of 768 dimensions and type number[]
  return embedding.values;
};
