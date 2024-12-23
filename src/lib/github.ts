import { db } from "@/server/db";
import { Octokit } from "octokit";
import axios from "axios";
import { aiSummarise } from "./gemini";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

interface Commit {
  commitHash: string;
  commitMessage: string;
  commitDate: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
}

// Polls new commits from a project's GitHub repository, generates summaries,
// and stores them in the database.
export const pollCommits = async (projectId: string) => {
  const githubUrl = await fetchProjectGithubUrl(projectId); // Fetch GitHub URL for the project
  const commitHashes = await getLatestCommits(githubUrl); // Fetch recent commits

  // Filter commits that have not yet been processed
  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes,
  );

  // Generate summaries for unprocessed commits
  const summaryResponses = await Promise.allSettled(
    unprocessedCommits.map((commit) => {
      return summariseCommit(githubUrl, commit.commitHash);
    }),
  );

  // Extract summaries from the settled promises
  const summaries = summaryResponses.map((response) => {
    if (response.status === "fulfilled") {
      return response.value; // Use the resolved summary
    }
    return ""; // Default to an empty string for rejected summaries
  });

  // Store the new commits and their summaries in the database
  const commits = await db.commit.createMany({
    data: summaries.map((summary, index) => {
      return {
        projectId,
        commitHash: unprocessedCommits[index]!.commitHash,
        commitMessage: unprocessedCommits[index]!.commitMessage,
        commitDate: unprocessedCommits[index]!.commitDate,
        commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
        commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
        summary, // AI-generated summary for the commit
      };
    }),
  });

  return commits; // Return the stored commit data
};

/**
 * Fetches the GitHub URL for a project using its database ID.
 */
async function fetchProjectGithubUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      githubUrl: true,
    },
  });
  if (!project?.githubUrl) {
    throw new Error("Project has no GitHub URL");
  }

  return project?.githubUrl;
}

/**
 * Fetches and processes the latest commits from a GitHub repository.
 */
async function getLatestCommits(githubUrl: string): Promise<Commit[]> {
  const [owner, repo] = githubUrl.split("/").slice(-2);

  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL");
  }

  // Fetch the list of commits from GitHub
  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  // Sort commits by date in descending order
  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  );

  // Map the sorted commits to the defined Commit interface
  return sortedCommits.slice(0, 10).map((commit: any) => ({
    commitHash: commit.sha,
    commitMessage: commit.commit.message ?? "",
    commitDate: commit.commit.author?.date ?? "",
    commitAuthorName: commit.commit.author?.name ?? "",
    commitAuthorAvatar: commit.author?.avatar_url ?? "",
  }));
}

/**
 * Filters out commits that have already been processed and stored in the database.
 * Returns only the unprocessed commits.
 */
async function filterUnprocessedCommits(
  projectId: string,
  commitHashes: Commit[],
) {
  const processedCommits = await db.commit.findMany({
    where: { projectId }, // Find commits linked to the project
  });

  // Filter out commits that already exist in the database
  const unprocessedCommits = commitHashes.filter(
    (commit) =>
      !processedCommits.some((c) => c.commitHash === commit.commitHash),
  );
  return unprocessedCommits;
}

/**
 * Fetches the diff for a specific commit from GitHub and generates a summary.
 */
async function summariseCommit(githubUrl: string, commitHash: string) {
  const { data: diff } = await axios.get(
    `${githubUrl}/commit/${commitHash}.diff`, // Fetch the commit diff from GitHub
    {
      headers: {
        Accept: "application/vnd.github.v3.diff", // Request GitHub's diff format
      },
    },
  );

  // Use the AI summarization function to generate a summary
  return await aiSummarise(diff);
}
