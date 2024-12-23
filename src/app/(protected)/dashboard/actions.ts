"use server";
import { generateEmbedding } from "@/lib/gemini";
import { db } from "@/server/db";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createStreamableValue } from "ai/rsc";
import { streamText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Assuming one token is roughly 4 characters long
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

export async function askQuestion(question: string, projectId: string) {
  const queryVector = await generateEmbedding(question);

  // Convert the query vector (array of numbers) into a string for use in the database query
  const vectorQuery = `[${queryVector.join(",")}]`;

  // Query the database to find the most relevant source code files based on the similarity of the question embedding
  const result = (await db.$queryRaw`
  SELECT "fileName", "sourceCode", "summary",
  1 - ("summaryEmbedding" <-> ${vectorQuery}::vector) AS similarity
  FROM "SourceCodeEmbedding"
  WHERE 1-("summaryEmbedding" <-> ${vectorQuery}::vector) > 0.04 
  AND "projectId" = ${projectId}
  ORDER BY similarity DESC
  LIMIT 10
  `) as { fileName: string; sourceCode: string; summary: string }[];

  let context = "";
  let contextFiles = result;

  // If similarity search returns empty, fetch all files for the project with token limit
  if (result.length === 0) {
    const allFiles = (await db.$queryRaw`
    SELECT "fileName", "sourceCode", "summary"
    FROM "SourceCodeEmbedding"
    WHERE "projectId" = ${projectId}
    `) as { fileName: string; sourceCode: string; summary: string }[];

    // const sortedFiles = allFiles.sort(
    //   (a, b) => (a.summary?.length || 0) - (b.summary?.length || 0),
    // );

    // Trying not to exceed the token limit
    const MAX_TOKENS = 900000;
    let currentTokenCount = 0;
    context = "INDIRECT CONTEXT: \n\n";

    for (const file of allFiles) {
      const fileTokens = estimateTokenCount(
        `source: ${file.fileName} \n Code content: ${file.sourceCode} \n summary of file: ${file.summary} \n`,
      );

      if (currentTokenCount + fileTokens <= MAX_TOKENS) {
        context += `source: ${file.fileName} \n Code content: ${file.sourceCode} \n summary of file: ${file.summary} \n`;
        currentTokenCount += fileTokens;
      } else {
        break; // Stop adding files if we're approaching the token limit
      }
    }

    // Still returning an empty array for contextFiles to indicate that the context is not from the similarity search
    contextFiles = [];
  } else {
    // Returning the normal context files if the similarity search returned results
    for (const doc of result) {
      context += `source: ${doc.fileName} \n Code content:  ${doc.sourceCode} \n summary of file: ${doc.summary} \n`;
    }
  }

  // Query the database to find the most relevant source code files based on the similarity of the question embedding.
  const stream = createStreamableValue();

  (async () => {
    try {
      const { textStream } = await streamText({
        model: google("gemini-1.5-flash"),
        prompt: `You are an AI code assistant specializing in answering questions about a codebase. Your target audience is a technical intern seeking to understand the codebase.

The AI assistant is a brand-new, powerful, human-like artificial intelligence.
The traits of the AI include expert knowledge, helpfulness, cleverness, and articulateness.
The AI is a well-behaved and well-mannered individual.
The AI is always friendly, kind, and inspiring, and is eager to provide vivid and thoughtful responses to the user.
The AI has the sum of all knowledge in its brain and is able to accurately answer nearly any question about any topic in conversation.

If the question is asking about code or a specific file, the AI will provide a detailed answer, giving step-by-step instructions, including code snippets (only if necessary). It will skip the code snippet if it is exactly same as a file in context block.

START CONTEXT BLOCK

${context}

END OF CONTEXT BLOCK

START QUESTION

${question}

END OF QUESTION

The AI assistant will take into account the provided CONTEXT BLOCK in the conversation.
If the context block begins with the text "INDIRECT CONTEXT", the AI assistant will say "I was unable to find information directly relevant to your question in the available code. However, based on the codebase I can see, here's what I can tell you: " and then provide any relevant insights from the available context.
The AI assistant will not apologize for previous responses but will instead indicate that new information was gained.
Answer in markdown syntax, with code snippets if needed. Be as detailed as possible when answering, and make sure there are no mistakes in the answer.
`,
      });

      for await (const delta of textStream) {
        stream.update(delta);
      }
      stream.done();
    } catch (error) {
      console.error(error);
      stream.update("Failed to answer question!");
      stream.done();
    }
  })();

  return {
    output: stream.value,
    filesReferences: contextFiles,
  };
}
