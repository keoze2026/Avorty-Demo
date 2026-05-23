import { Book, Code2, FileText, Terminal, Zap, GitBranch, Layers, Shield } from "lucide-react"
import Link from "next/link"

const docCategories = [
  {
    icon: Zap,
    title: "Getting Started",
    description: "Quick start guide to deploy your first app in minutes",
    links: ["Installation", "Quick Start", "First Deployment"],
  },
  {
    icon: Code2,
    title: "Framework Guides",
    description: "Detailed guides for React, Next.js, Vue, and more",
    links: ["Next.js", "React", "Vue.js", "Svelte"],
  },
  {
    icon: Terminal,
    title: "CLI Reference",
    description: "Complete command reference for the Vortyx CLI",
    links: ["Commands", "Configuration", "Plugins"],
  },
  {
    icon: GitBranch,
    title: "Git Integration",
    description: "Connect your repositories for automatic deployments",
    links: ["GitHub", "GitLab", "Bitbucket"],
  },
  {
    icon: Layers,
    title: "API Reference",
    description: "REST and GraphQL APIs for programmatic access",
    links: ["REST API", "GraphQL", "Webhooks"],
  },
  {
    icon: Shield,
    title: "Security",
    description: "Best practices for securing your applications",
    links: ["SSL/TLS", "Environment Variables", "Access Control"],
  },
]

export function DocsSection() {
  return (
    <section id="docs" className="py-24 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-accent">
            <Book className="h-4 w-4" />
            <span className="font-mono uppercase tracking-wider">Documentation</span>
          </div>
          <h2 className="mt-4 font-mono text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to know</h2>
          <p className="mt-4 text-muted-foreground">
            Comprehensive documentation to help you get started and master every feature of Vortyx.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {docCategories.map((category, index) => (
            <div
              key={index}
              className="group relative rounded-xl border border-border/60 bg-[#141414] p-6 transition-all duration-300 hover:border-accent/40 hover:bg-[#1a1a1a] scale-100 hover:scale-105"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <category.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-mono font-semibold">{category.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
              <ul className="mt-4 space-y-2">
                {category.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href="#"
                      className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
                    >
                      <FileText className="h-3 w-3" />
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="#" className="inline-flex items-center gap-2 font-mono text-sm text-accent hover:underline">
            View full documentation
            <span>â†’</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
