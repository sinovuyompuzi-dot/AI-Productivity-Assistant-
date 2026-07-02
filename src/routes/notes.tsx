import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Loader2, Sparkles, ListChecks, Gavel, Target, Clock, User, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { summarizeNotes } from "@/lib/ai.functions";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — AI Workplace" },
      { name: "description", content: "Turn raw meeting notes into summaries, action items, and decisions." },
      { property: "og:title", content: "Meeting Notes Summarizer" },
      { property: "og:description", content: "Extract structured insights from meeting notes with AI." },
    ],
  }),
  component: NotesPage,
});

type Result = Awaited<ReturnType<typeof summarizeNotes>>;

function ListCard({ icon: Icon, title, items, accent }: { icon: any; title: string; items: string[]; accent?: string }) {
  return (
    <Card className="rounded-2xl animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className={`grid h-8 w-8 place-items-center rounded-lg ${accent ?? "bg-primary/10 text-primary"}`}>
            <Icon className="h-4 w-4" />
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <ul className="space-y-2 text-sm">
            {items.map((it, i) => (
              <li key={i} className="flex gap-2"><span className="text-primary">•</span><span>{it}</span></li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">None identified.</p>
        )}
      </CardContent>
    </Card>
  );
}

function NotesPage() {
  const fn = useServerFn(summarizeNotes);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const mut = useMutation({
    mutationFn: (text: string) => fn({ data: { notes: text } }),
    onSuccess: (res) => {
      setResult(res);
      toast.success("Summary ready!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = () => {
    if (notes.trim().length < 10) {
      toast.error("Paste at least a few sentences of notes.");
      return;
    }
    mut.mutate(notes);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      <header className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Meeting Notes Summarizer</h1>
          <p className="text-sm text-muted-foreground">Paste raw notes — get structured insights.</p>
        </div>
      </header>

      <h2 className="sr-only">Your Meeting Notes</h2>
      <Card className="rounded-2xl">
        <CardHeader><CardTitle>Your Meeting Notes</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={10}
            placeholder="Paste your meeting notes here..."
            className="resize-y"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={submit} disabled={mut.isPending} className="rounded-xl">
              {mut.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarizing...</> : <><Sparkles className="mr-2 h-4 w-4" /> Summarize</>}
            </Button>
            <Button variant="ghost" onClick={() => { setNotes(""); setResult(null); }} className="rounded-xl">
              <Trash2 className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {mut.isPending && (
        <div className="grid place-items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Analyzing your notes...</p>
        </div>
      )}

      {result && (
        <>
          <h2 className="sr-only">Summary and insights</h2>
          <Card className="rounded-2xl animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </span>
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{result.summary}</p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <ListCard icon={ListChecks} title="Key Points" items={result.keyPoints} />
            <ListCard icon={Gavel} title="Decisions Made" items={result.decisions} />
            <ListCard icon={Target} title="Action Items" items={result.actionItems} />
            <ListCard icon={Clock} title="Deadlines" items={result.deadlines} />
            <ListCard icon={User} title="Responsible Persons" items={result.responsiblePersons} />
          </div>
        </>
      )}
    </div>
  );
}