import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

// Initialize Octokit without token as requested
const octokit = new Octokit();

interface RepoInput {
  url: string;
}

export interface MetricResult {
  url: string;
  name: string;
  owner: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  languages: Record<string, number>;
  totalCommits: number; // Approximate from recent history or API
  recentCommitsCount: number; // Last 90 days
  contributorsCount: number;
  activityScore: number;
  complexityEstimation: string; // e.g., "Low", "Medium", "High"
  learningDifficulty: "Beginner" | "Intermediate" | "Advanced";
  error?: string;
  avatarUrl: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const urls: string[] = body.urls || [];

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "Please provide a valid array of GitHub repository URLs." },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      urls.map((url) => analyzeRepo(url))
    );

    return NextResponse.json({ data: results }, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function analyzeRepo(urlString: string): Promise<MetricResult> {
  const resultTemplate: Partial<MetricResult> = {
    url: urlString,
    name: "Unknown",
    owner: "Unknown",
    avatarUrl: "",
    error: undefined,
  };

  try {
    // 1. Parse URL safely
    let url: URL;
    try {
      url = new URL(urlString);
    } catch {
      return { ...resultTemplate, error: "Invalid URL format" } as MetricResult;
    }

    if (url.hostname !== "github.com") {
      return { ...resultTemplate, error: "Not a GitHub URL" } as MetricResult;
    }

    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) {
      return { ...resultTemplate, error: "Invalid GitHub repository URL" } as MetricResult;
    }

    const owner = parts[0];
    const repoPath = parts[1]; // Removed .git if it exists
    const repo = repoPath.endsWith(".git") ? repoPath.slice(0, -4) : repoPath;

    // 2. Fetch basic repo info
    try {
      const { data: repoData } = await octokit.rest.repos.get({
        owner,
        repo,
      });

      // 3. Fetch languages
      const { data: languages } = await octokit.rest.repos.listLanguages({
        owner,
        repo,
      });

      // 4. Fetch recent commits (last 90 days) for Activity Score
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      let recentCommitsCount = 0;
      try {
        const { data: commits } = await octokit.rest.repos.listCommits({
          owner,
          repo,
          since: ninetyDaysAgo.toISOString(),
          per_page: 100, // Just need an estimate
        });
        recentCommitsCount = commits.length;
      } catch (e) {
        console.warn(`Failed to fetch commits for ${owner}/${repo}:`, e);
      }

      // 4b. Fetch contributors
      let contributorsCount = 0;
      try {
        const { data: contributors } = await octokit.rest.repos.listContributors({
          owner,
          repo,
          per_page: 100 // Estimate
        });
        contributorsCount = contributors.length;
      } catch (e) {
        console.warn(`Failed to fetch contributors for ${owner}/${repo}:`, e);
      }

      // 5. Calculate Activity Score (out of 100)
      // Original Formula: (commits_last_90_days * 0.5) + (issues_opened_closed_last_90_days * 0.3) + (recent_active_contributors * 0.2)
      // Since listContributors gets all contributors, we'll use an estimate based on capped limits.
      const cappedRecentCommits = Math.min(recentCommitsCount, 100);
      const cappedOpenIssues = Math.min(repoData.open_issues_count, 50);
      const cappedContributors = Math.min(contributorsCount, 50);

      const commitScore = (cappedRecentCommits / 100) * 50;  // Max 50 pts
      const issuesScore = (cappedOpenIssues / 50) * 30;      // Max 30 pts
      const contributorsScore = (cappedContributors / 50) * 20; // Max 20 pts

      const activityScore = Math.round(commitScore + issuesScore + contributorsScore);


      // 6. Calculate Complexity Estimation
      // Based on number of languages, and repo size (kb)
      const numLanguages = Object.keys(languages).length;
      let complexityEstimation = "Low";
      if (numLanguages > 4 || repoData.size > 50000) {
        complexityEstimation = "High";
      } else if (numLanguages > 2 || repoData.size > 10000) {
        complexityEstimation = "Medium";
      }

      // 7. Calculate Learning Difficulty
      // Beginner: High activity (active community), lower complexity.
      // Advanced: High complexity, lower relative activity (harder to get help)
      let learningDifficulty: "Beginner" | "Intermediate" | "Advanced" = "Intermediate";

      if (complexityEstimation === "Low" && activityScore > 30) {
        learningDifficulty = "Beginner";
      } else if (complexityEstimation === "High" || repoData.size > 100000) {
        learningDifficulty = "Advanced";
      } else if (complexityEstimation === "Low" && activityScore <= 30) {
        learningDifficulty = "Intermediate"; // Harder because fewer active devs to help
      }


      return {
        url: urlString,
        name: repoData.name,
        owner: repoData.owner.login,
        avatarUrl: repoData.owner.avatar_url,
        description: repoData.description,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        openIssues: repoData.open_issues_count,
        languages,
        totalCommits: 0, // Hard to get exact total quickly without pagination limits
        recentCommitsCount,
        contributorsCount,
        activityScore,
        complexityEstimation,
        learningDifficulty
      };

    } catch (e: any) {
      if (e.status === 404) {
        return { ...resultTemplate, error: "Repository not found or is private." } as MetricResult;
      }
      if (e.status === 403) {
        console.warn("Rate limit hit");
        return { ...resultTemplate, error: "GitHub API Rate limit exceeded." } as MetricResult;
      }
      return { ...resultTemplate, error: "Failed to fetch data from GitHub API." } as MetricResult;
    }

  } catch (error) {
    return { ...resultTemplate, error: "Unexpected error occurred" } as MetricResult;
  }
}
