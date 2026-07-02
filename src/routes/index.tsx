import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Mail, FileText, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Workplace Productivity Assistant" },
      { name: "description", content: "Automate workplace tasks with AI: write emails, summarize meetings, and plan your day." },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      { property: "og:description", content: "Automate workplace tasks with AI: write emails, summarize meetings, and plan your day." },
    ],
  }),
  component: Index,
});

const features = [
  { to: "/email" as const, title: "Smart Email Generator", desc: "Draft polished, on-tone emails to clients, managers, and teammates in seconds.", icon: Mail },
  { to: "/notes" as const, title: "Meeting Notes Summarizer", desc: "Turn raw meeting notes into clean summaries, action items, and deadlines.", icon: FileText },
  { to: "/planner" as const, title: "AI Task Planner", desc: "Get a prioritized, time-blocked daily schedule built around your priorities.", icon: Calendar },
];

function Index() {
  return (
    <div className="mx-auto max-w-6xl animate-fade-in">
      <section className="rounded-3xl bg-gradient-to-br from-primary to-primary/70 p-8 text-primary-foreground shadow-xl lg:p-14">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" /> Powered by Lovable AI
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          AI Workplace Productivity Assistant
        </h1>
        <p className="mt-4 max-w-2xl text-base text-primary-foreground/90 sm:text-lg">
          This application uses Artificial Intelligence to help employees automate workplace tasks, save time, improve communication, and increase productivity.
        </p>
        <Button asChild size="lg" variant="secondary" className="mt-6 rounded-xl">
          <Link to="/email">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>

      <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <h2 className="sr-only">Features</h2>
        {features.map(({ to, title, desc, icon: Icon }) => (
          <Link key={to} to={to} className="group">
            <Card className="h-full rounded-2xl border-border/60 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
