import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Calendar, Loader2, Sparkles, ListChecks, Layers, Coffee, Lightbulb, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateSchedule } from "@/lib/ai.functions";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — AI Workplace" },
      { name: "description", content: "Build a prioritized, time-blocked daily schedule with AI." },
      { property: "og:title", content: "AI Task Planner" },
      { property: "og:description", content: "Prioritized to-dos, schedule, breaks, and productivity tips." },
    ],
  }),
  component: PlannerPage,
});

type Result = Awaited<ReturnType<typeof generateSchedule>>;

function PlannerPage() {
  const fn = useServerFn(generateSchedule);
  const [form, setForm] = useState({ workingHours: "9:00 AM - 5:00 PM", tasks: "", priority: "" });
  const [result, setResult] = useState<Result | null>(null);

  const mut = useMutation({
    mutationFn: (data: typeof form) => fn({ data }),
    onSuccess: (res) => { setResult(res); toast.success("Schedule generated!"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tasks.trim() || !form.priority.trim()) {
      toast.error("Please list your tasks and highest priority.");
      return;
    }
    mut.mutate(form);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      <header className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Calendar className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">AI Task Planner</h1>
          <p className="text-sm text-muted-foreground">Generate a focused, time-blocked day.</p>
        </div>
      </header>

      <h2 className="sr-only">Plan Your Day</h2>
      <Card className="rounded-2xl">
        <CardHeader><CardTitle>Plan Your Day</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hours">Working Hours</Label>
              <Input id="hours" value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Highest Priority Task</Label>
              <Input id="priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} placeholder="Finish client proposal" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tasks">Tasks to Complete</Label>
              <Textarea id="tasks" rows={5} value={form.tasks} onChange={(e) => setForm({ ...form, tasks: e.target.value })} placeholder="One per line: emails, proposal draft, team standup, code review..." />
            </div>
            <div className="md:col-span-2 flex flex-wrap gap-2">
              <Button type="submit" disabled={mut.isPending} className="rounded-xl">
                {mut.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate Schedule</>}
              </Button>
              <Button type="button" variant="ghost" onClick={() => { setForm({ workingHours: "9:00 AM - 5:00 PM", tasks: "", priority: "" }); setResult(null); }} className="rounded-xl">
                <Trash2 className="mr-2 h-4 w-4" /> Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {mut.isPending && (
        <div className="grid place-items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Building your schedule...</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <h2 className="sr-only">Your generated schedule</h2>
          <Card className="rounded-2xl animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><ListChecks className="h-4 w-4" /></span>
                Prioritized To-Do List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm">
                {result.todos.map((t, i) => (
                  <li key={i} className="flex gap-3 rounded-lg bg-muted/50 p-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card className="rounded-2xl animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><Calendar className="h-4 w-4" /></span>
                Daily Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-4 border-l-2 border-primary/30 pl-6">
                {result.schedule.map((s, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[31px] grid h-5 w-5 place-items-center rounded-full bg-primary ring-4 ring-background">
                      <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                    </span>
                    <div className="rounded-xl border border-border bg-card p-3">
                      <div className="text-xs font-semibold text-primary">{s.time}</div>
                      <div className="text-sm">{s.task}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-2xl animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><Layers className="h-4 w-4" /></span>
                  Time Blocks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {result.timeBlocks.map((b, i) => <li key={i} className="flex gap-2"><span className="text-primary">•</span><span>{b}</span></li>)}
                </ul>
              </CardContent>
            </Card>
            <Card className="rounded-2xl animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><Coffee className="h-4 w-4" /></span>
                  Break Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {result.breaks.map((b, i) => <li key={i} className="flex gap-2"><span className="text-primary">•</span><span>{b}</span></li>)}
                </ul>
              </CardContent>
            </Card>
            <Card className="rounded-2xl animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><Lightbulb className="h-4 w-4" /></span>
                  Productivity Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {result.tips.map((t, i) => <li key={i} className="flex gap-2"><span className="text-primary">•</span><span>{t}</span></li>)}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}