import { createFileRoute } from "@tanstack/react-router";
import { Info, ShieldAlert, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — AI Workplace Productivity Assistant" },
      { name: "description", content: "Learn how AI Workplace helps automate repetitive office tasks responsibly." },
      { property: "og:title", content: "About AI Workplace" },
      { property: "og:description", content: "AI-powered assistant for everyday workplace productivity." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <header className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Info className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold">About</h1>
      </header>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> What this app does</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-foreground/80">
          <p>
            The <strong>AI Workplace Productivity Assistant</strong> helps employees automate
            repetitive office tasks using Artificial Intelligence. It drafts professional emails,
            summarizes meeting notes into actionable insights, and builds prioritized daily
            schedules — so you can spend less time on busywork and more time on the work that matters.
          </p>
          <p>
            Built for professionals across teams, the assistant adapts to different communication
            styles, recipient types, and working patterns to give you results that actually fit your day.
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <ShieldAlert className="h-5 w-5" /> Responsible AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-foreground/80">
          <p>
            AI-generated content should <strong>always be reviewed</strong> before being used for
            business purposes. Models can make factual mistakes, miss context, or produce text that
            doesn't match your organization's tone or policies.
          </p>
          <p>
            Treat AI output as a strong first draft — read it carefully, edit where needed, and
            verify any facts, names, dates, or commitments before sending an email, sharing a
            summary, or acting on a schedule.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}