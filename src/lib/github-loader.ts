import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateEmbedding, summariseCode } from "./gemini";
import { db } from "@/server/db";

/**
 * Indexes a GitHub repository by loading all the documents from the repository,
 * summarizing the code, and generating embeddings of the summaries.
 * The embeddings are then stored in the database.
 */
export const indexGithubRepo = async (
  projectid: string,
  githubUrl: string,
  branch?: string,
  githubToken?: string,
) => {
  // loading all the docs from the github repo
  const docs = await loadGithubRepo(githubUrl, branch, githubToken);
  console.log(`Loaded ${docs.length} documents from ${githubUrl}`);
  // summarises the code and generates embeddings of the summary
  const allEmbeddings = await generateEmbeddings(docs);
  console.log(`Generated embeddings for ${allEmbeddings.length} documents`);

  await Promise.allSettled(
    allEmbeddings.map(async (embedding) => {
      if (!embedding) return;
      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          projectId: projectid,
          fileName: embedding.fileName,
          summary: embedding.summary,
          sourceCode: embedding.sourceCode,
        },
      });
      await db.$executeRaw`
      UPDATE "SourceCodeEmbedding"
      SET "summaryEmbedding" = ${embedding.summaryEmbedding}::vector
      WHERE "id" = ${sourceCodeEmbedding.id}
      `;
    }),
  );
};

// Function to load all documents from a GitHub repository
const loadGithubRepo = async (
  githubUrl: string,
  branch?: string,
  githubToken?: string,
) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || process.env.GITHUB_ACCESS_TOKEN,
    branch: branch || "main",
    ignorePaths: [
      "node_modules",
      ".git",
      "**/package-lock.json",
      "**/yarn.lock",
      "**/pnpm-lock.yaml",
      "**/bun.lockb",
      "**/dist",
      "**/*.png",
      "**/*.jpg",
      "**/*.jpeg",
      "**/*.svg",
      "**/*.gif",
      "**/*.ico",
      "**/*.pdf",
      "**/*.zip",
      "**/*.mp4",
      "**/*.mp3",
      "**/*.avi",
      "**/*.mov",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5, // Defaults to 2
  });
  const docs = await loader.load();
  return docs;
};

/**
 * Summarizes the code and generates embeddings for all the documents.
 */
const generateEmbeddings = async (docs: Document[]) => {
  // generating embeddings for all the docs
  return await Promise.all(
    docs.map(async (doc) => {
      // summarising the code
      const summary = await summariseCode(doc);
      console.log(`Summarised code for ${doc.metadata.source}`);
      // generating the embedding
      const summaryEmbedding = await generateEmbedding(summary);
      return {
        summary,
        summaryEmbedding,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)), // performing a deep copy of the page content
        fileName: doc.metadata.source,
      };
    }),
  );
};
