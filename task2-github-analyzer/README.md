# GitHub Repository Intelligence Analyzer

A sophisticated Next.js application that analyzes multiple GitHub repositories and generates insights about their activity, complexity, and learning difficulty. 
Built specifically for WebiU Pre-GSoC 2026 Tasks.

## 🚀 Features

- **Batch Processing**: Analyze multiple GitHub repositories simultaneously (one URL per line).
- **Premium UI**: Designed with TailwindCSS and Framer Motion for a stunning, glassmorphism-inspired dark mode experience.
- **Activity Scoring**: Custom algorithm to evaluate repo health based on recent commits, open issues, and fork count.
- **Complexity Estimation**: Automatic "Low", "Medium", or "High" classification based on language diversity and repository size.
- **Learning Difficulty Classification**: "Beginner", "Intermediate", or "Advanced" based on community activity vs codebase complexity.
- **Rate Limit Aware**: Handles GitHub API rate limits gracefully, with support for Personal Access Tokens.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **API Client**: `@octokit/rest`
- **Deployment**: Designed for Vercel

## ⚙️ How to Run Locally

1. **Clone the repository / Navigate to directory**:
   ```bash
   cd task2-github-analyzer
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Open Application**:
   Visit `http://localhost:3000` in your browser.

## 📐 Scoring Methodology and Assumptions

### 1. Activity Score (Max 100 Points)
Calculates recent repository momentum to gauge if the project is actively maintained.
- **Recent Commits (Max 50 pts)**: Based on commits in the last 90 days. Cap at 100 commits = 50 points.
- **Open Issues (Max 30 pts)**: Calculates engagement / community reporting. Cap at 50 issues = 30 points.
- **Contributors (Max 20 pts)**: Calculates number of active developers attached to the repo. Cap at 50 contributors = 20 points.
*Assumption*: Rate limits prevent us from accurately fetching the total historical commit count quickly without pagination limits. We prioritize recent activity (last 90 days) alongside community support (issues/contributors) as stronger indicators of current project health than lifetime overarching commits or forks.

### 2. Complexity Estimation
Classifies the technical overhead of contributing to the repository.
- **High**: >4 Languages OR uncompressed size > 50,000 KB.
- **Medium**: >2 Languages OR uncompressed size > 10,000 KB.
- **Low**: 1-2 Languages and smaller file size.
*Assumption*: True file/dependency counting requires fetching the entire Git tree recursively, which is expensive API-wise. We use reported languages and repository size as a highly-correlated proxy for complexity.

### 3. Learning Difficulty
Classifies the effort required for a new maintainer/contributor to ramp up.
- **Beginner**: Low Complexity AND High Activity (>30). (Easy codebase + active devs to answer questions).
- **Advanced**: High Complexity OR Massive Codebase (>100,000 KB).
- **Intermediate**: Everything else (e.g., Low Complexity but Low Activity, meaning you're on your own if you get stuck).

## 🛡️ Edge Cases Handled

- **Invalid URLs**: Validates GitHub URL format before querying API.
- **Private/Deleted Repositories**: Gracefully catches 404s and returns a specific intelligence card highlighting the error without breaking the batch process.
- **0 Commits/Low Activity**: Activity Score algorithm prevents negative values and simply outputs a lowest-bound score.
- **API Exceedance**: Catches 403 Rate Limit errors and informs the user specifically.

## 📝 Example Output

Run the application and try analyzing the following repositories:
```text
https://github.com/facebook/react
https://github.com/vercel/next.js
https://github.com/tailwindlabs/tailwindcss
https://github.com/framer/motion
https://github.com/octokit/rest.js
```

### Dashboard View:
![Live Interface showing Intelligence Reports on parsed Next, React, framer-motion endpoints](/Users/pratham/Desktop/project/webiu-gsoc-2026-tasks/task2-github-analyzer/public/example_analysis.png)
