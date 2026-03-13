"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Loader2, AlertCircle, TrendingUp, GitFork, Star, CircleDot, Activity, Brain, Code2, AlertTriangle, CheckCircle2, Users } from "lucide-react";
import { MetricResult } from "./api/analyze/route";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [urlsInput, setUrlsInput] = useState("");
  const [results, setResults] = useState<MetricResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const urls = urlsInput
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (urls.length === 0) {
      setError("Please enter at least one GitHub repository URL.");
      return;
    }

    setIsLoading(true);
    setResults([]);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ urls }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze repositories.");
      }

      setResults(data.data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30 font-sans pb-24">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">

        {/* Header Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-4 mb-16"
        >
          <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6 backdrop-blur-sm">
            <Github className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 pb-2">
            GitHub Repository Intelligence
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Uncover deep insights, complexity estimations, and learning difficulty classifications for multiple repositories instantly.
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="max-w-3xl mx-auto mb-16"
        >
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
              <label htmlFor="urls" className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                Repository URLs (One per line)
              </label>
              <textarea
                id="urls"
                rows={5}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-y shadow-inner font-mono text-sm leading-relaxed"
                placeholder="https://github.com/facebook/react&#10;https://github.com/vercel/next.js"
                value={urlsInput}
                onChange={(e) => setUrlsInput(e.target.value)}
              />
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative overflow-hidden inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 active:scale-[0.98]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing Ecosystem...
                      </>
                    ) : (
                      <>
                        <Activity className="w-5 h-5" />
                        Analyze Repositories
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-semibold flex items-center gap-3 text-slate-200 pl-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                Intelligence Reports
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((result, index) => (
                  <ResultCard key={`${result.url}-${index}`} result={result} index={index} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ResultCard({ result, index }: { result: MetricResult; index: number }) {
  if (result.error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className="bg-rose-500/5 backdrop-blur-md border border-rose-500/20 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center text-center space-y-4"
      >
        <AlertCircle className="w-12 h-12 text-rose-400" />
        <div className="space-y-1">
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-300 text-sm font-mono truncate max-w-[200px] block mx-auto underline underline-offset-4 decoration-rose-500/30">
            {result.url.replace('https://github.com/', '')}
          </a>
          <p className="text-rose-300 font-medium mt-2">{result.error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-slate-900/60 backdrop-blur-md border border-slate-700/50 hover:border-indigo-500/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          {result.avatarUrl ? (
            <img src={result.avatarUrl} alt={result.owner} className="w-12 h-12 rounded-xl ring-2 ring-slate-800 object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center ring-2 ring-slate-700">
              <Github className="w-6 h-6 text-slate-400" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1" title={result.name}>
              {result.name}
            </h3>
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              <span className="truncate max-w-[120px]" title={result.owner}>{result.owner}</span>
            </p>
          </div>
        </div>
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-indigo-400 transition-colors p-2 bg-slate-800/50 rounded-lg hover:bg-indigo-500/10"
        >
          <Github className="w-4 h-4" />
        </a>
      </div>

      <p className="text-slate-400 text-sm mb-6 line-clamp-2 min-h-[40px] leading-relaxed">
        {result.description || "No description provided."}
      </p>

      {/* Intelligence Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge
          icon={<Brain className="w-3.5 h-3.5" />}
          label="Difficulty"
          value={result.learningDifficulty}
          color={
            result.learningDifficulty === "Beginner" ? "emerald" :
              result.learningDifficulty === "Intermediate" ? "amber" : "rose"
          }
        />
        <Badge
          icon={<CircleDot className="w-3.5 h-3.5" />}
          label="Complexity"
          value={result.complexityEstimation}
          color={
            result.complexityEstimation === "Low" ? "emerald" :
              result.complexityEstimation === "Medium" ? "amber" : "rose"
          }
        />
      </div>

      <div className="flex-grow"></div>

      {/* Top Languages */}
      {Object.keys(result.languages).length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(result.languages).slice(0, 3).map(([lang]) => (
              <span key={lang} className="text-xs px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                {lang}
              </span>
            ))}
            {Object.keys(result.languages).length > 3 && (
              <span className="text-xs px-2 py-1 rounded-md bg-slate-800/50 border border-slate-700/50 text-slate-500">
                +{Object.keys(result.languages).length - 3}
              </span>
            )}
          </div>
        </div>
      )}


      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
        <Stat icon={<Star className="w-4 h-4 text-amber-400" />} label="Stars" value={result.stars.toLocaleString()} />
        <Stat icon={<GitFork className="w-4 h-4 text-slate-400" />} label="Forks" value={result.forks.toLocaleString()} />
        <Stat icon={<AlertCircle className="w-4 h-4 text-rose-400" />} label="Issues" value={result.openIssues.toLocaleString()} />
        <Stat icon={<Users className="w-4 h-4 text-emerald-400" />} label="Contributors" value={result.contributorsCount} />
      </div>

      <div className="mt-4 bg-indigo-500/10 rounded-xl p-3 flex flex-row justify-between items-center border border-indigo-500/20 col-span-1">
        <span className="text-sm text-indigo-300 font-medium flex items-center gap-2"><Activity className="w-4 h-4" /> Activity Score</span>
        <div className="flex items-baseline gap-1 mt-1 font-mono">
          <span className="text-xl font-bold text-indigo-400">{result.activityScore}</span>
          <span className="text-xs text-indigo-500">/ 100</span>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-slate-950/50 rounded-xl p-3 flex flex-col justify-between border border-slate-800/50">
      <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">{icon} {label}</span>
      <span className="text-lg font-semibold text-slate-200 mt-1">{value}</span>
    </div>
  );
}

function Badge({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: "emerald" | "amber" | "rose" }) {
  const colorStyles = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <div className={cn("px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5", colorStyles[color])}>
      {icon}
      <span className="opacity-80 hidden sm:inline">{label}:</span>
      <span>{value}</span>
    </div>
  );
}
