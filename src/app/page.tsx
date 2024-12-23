"use client";

import { Button } from "@/components/ui/button";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import {
  Code2,
  Search,
  GitBranch,
  Zap,
  Github,
  MoveRight,
  GithubIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const highlights = [
  {
    title: "Ask Questions About Code",
    description:
      "Get instant answers to your code-related questions using our AI-powered query system.",
    icon: Code2,
  },
  {
    title: "View Commit History",
    description:
      "Understand the evolution of your code by exploring detailed commit histories and changes, all summarized by AI.",
    icon: GitBranch,
  },
  {
    title: "Real-time Collaboration",
    // basically allow users to invite others users to project, who can then also save questions in your project
    description:
      " Collaborate with your team in real-time, share code snippets, and ask questions about your codebase.",
    icon: Zap,
  },
  {
    title: "Search Codebase",
    description:
      "Quickly find relevant code snippets, functions, and classes using our advanced search system.",
    icon: Search,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-slate-800/50 bg-zinc-900/80 px-6 py-5 md:px-10">
        <Link href="/" className="flex items-center justify-center gap-2">
          <img src="/logo.png" alt="Aicarus Logo" width={40} height={40} />
          <span className="font-mono text-2xl font-bold text-white max-sm:hidden">
            Aicarus
          </span>
        </Link>
        <nav className="space-x-4">
          <Button variant="link" className="bg-slate-600/50 text-white" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button variant="default" className="hover:bg-[#15803D]/80" asChild>
            <Link href="/sign-up">Sign Up</Link>
          </Button>
        </nav>
      </header>

      <main className="flex flex-col gap-16">
        {/* Hero */}
        <section className="mx-auto mt-32 flex max-w-[80vw] flex-col items-center gap-8">
          <Image src="/logo.png" alt="Aicarus Logo" width={100} height={100} />
          <div className="mb-10 text-center">
            <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-6xl">
              <span className="inline bg-gradient-to-r from-[#F596D3] to-[#D247BF] bg-clip-text text-transparent">
                AI-Powered
              </span>{" "}
              Code Understanding for{" "}
              <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] bg-clip-text text-transparent">
                Developers
              </span>
            </h1>
            <p className="mb-8 text-xl text-gray-300">
              Aicarus helps you quickly comprehend your codebase, find relevant
              code, and get answers to your programming questions, all powered
              by advanced AI.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                size="lg"
                className="bg-primary text-lg text-white hover:bg-[#15803D]"
                asChild
              >
                <Link href="/dashboard">
                  Get Started <MoveRight className="inline" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-black px-3 text-lg text-white"
                asChild
              >
                <Link href="https://github.com/mridxl/aicarus" target="_blank">
                  Github Repository <GithubIcon className="inline" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="hero-shadow"></div>
        </section>

        {/* Features */}
        <section className="-mb-28 mt-7 px-6 py-20 md:px-10">
          <div className="relative mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-4xl font-bold text-white underline underline-offset-8">
              Key Features
            </h2>
            <HoverEffect items={highlights} />
          </div>
        </section>

        {/* CTA */}
        <section className="flex flex-col items-center px-6 py-20 md:px-10">
          <img src="/growth.png" className="mb-8 h-72" />
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-white">
              Ready to supercharge your development process?
            </h2>
            <p className="mb-8 text-xl text-gray-300">
              Join Aicarus today and experience the power of AI-assisted code
              understanding.
            </p>
            <div className="space-x-4">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-xl text-black hover:bg-white/80"
                asChild
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button
                size="lg"
                className="bg-primary text-xl text-white hover:bg-[#15803D]"
                asChild
              >
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-6 py-6 text-center md:px-10">
        <p className="text-sm text-white/70">
          Made with <span className="text-red-500">❤️</span> by{" "}
          <Link
            className="inline underline"
            target="_blank"
            href="https://github.com/mridxl"
          >
            Mridul
          </Link>
        </p>
      </footer>
    </div>
  );
}
