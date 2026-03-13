# WebiU GSoC 2026: Pre-GSoC Tasks Submission

## 📌 Overview

Welcome to my submission for the WebiU Pre-GSoC 2026 tasks. 

Approaching these challenges, I prioritized production-grade reliability, aggressive API rate-limit management, and scalable data processing. The solutions provided here are designed not just to meet the baseline requirements, but to simulate a real-world, highly available enterprise environment.



---

## 📖 How to Review This Submission

To get the most context out of this repository, please review the documents in the following order:

### 1. The Architecture (Task 1)
Please open [`TASK1_DESIGN.md`](./TASK1_DESIGN.md) first. 
* **What to look for:** Pay special attention to the **Dual-Ingestion Strategy** (Section 2) and the **Rate Limit Handling** (Section 3). 
* **The Goal:** Demonstrating how to decouple the WebiU frontend from the GitHub API using a Redis-backed message broker and webhook event listeners, ensuring the system can scale seamlessly from 300 to 10,000+ repositories without hitting GitHub's 5,000 req/hr ceiling.

### 2. The Implementation (Task 2)
After reviewing the system design, proceed to the `webiu-analyzer` directory for the active code submission.
* **Live Deployment:** [Vercel URL here]
* **Source Code & Logic:** See [`webiu-analyzer/README.md`](./webiu-analyzer/README.md) for local setup instructions, API route structures, and the mathematical formulas used to calculate Repository Activity, Complexity, and Learning Difficulty.

---

## ⚡ Key Engineering Decisions Highlighted

For quick reference, here are the core architectural decisions made across these tasks:
* **GraphQL over REST:** Migrating bulk data fetching to GitHub's GraphQL API to drastically reduce rate-limit consumption.
* **Event-Driven Updates:** Utilizing GitHub Webhooks for real-time updates (Push) to avoid the overhead of constant Cron polling (Pull).
* **Circuit Breaker Pattern:** Implementing a Redis read-through cache that serves stale data if the primary PostgreSQL database or GitHub API experiences an outage, ensuring zero downtime for the frontend.
* **Stateless Workers:** Ensuring the backend processing nodes can be horizontally auto-scaled based on queue depth during traffic spikes.

---

Thank you for your time and review. I look forward to discussing these architectural choices further!
