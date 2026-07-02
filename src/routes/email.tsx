import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, RefreshCw, Trash2, Loader2, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateEmail } from "@/lib/ai.functions";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI Workplace" },
      { name: "description", content: "Generate professional workplace emails with the right tone in seconds." },
      { property: "og:title", content: "Smart Email Generator" },
      { property: "og:description", content: "Draft on-tone emails to clients, managers, and teammates." },
    ],
  }),
  component: EmailPage,
});

type Form = {
  recipientType: "Client" | "Manager" | "Team Member";
  subject: string;
  purpose: string;
  tone: "Formal" | "Friendly" | "Persuasive";
};

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const [form, setForm] = useState<Form>({
    recipientType: "Client",
    subject: "",
    purpose: "",
    tone: "Formal",
  });
  const [email, setEmail] = useState("");

  const mut = useMutation({
    mutationFn: (data: Form) => fn({ data }),
    onSuccess: (res) => {
      setEmail(res.email);
      toast.success("Email generated!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.purpose.trim()) {
      toast.error("Please fill in subject and purpose.");
      return;
    }
    mut.mutate(form);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(email);
    toast.success("Copied to clipboard");
  };

  const clear = () => {
    setEmail("");
    setForm({ recipientType: "Client", subject: "", purpose: "", tone: "Formal" });
    toast.success("Cleared");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <header className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Mail className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Smart Email Generator</h1>
          <p className="text-sm text-muted-foreground">Compose professional emails with AI.</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle asChild><h2>Email Details</h2></CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label>Recipient Type</Label>
                <Select value={form.recipientType} onValueChange={(v) => setForm({ ...form, recipientType: v as Form["recipientType"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Client">Client</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Team Member">Team Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Q4 project update" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Email</Label>
                <Textarea id="purpose" rows={4} value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="Share progress and request approval for next phase..." />
              </div>
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={form.tone} onValueChange={(v) => setForm({ ...form, tone: v as Form["tone"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Formal">Formal</SelectItem>
                    <SelectItem value="Friendly">Friendly</SelectItem>
                    <SelectItem value="Persuasive">Persuasive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={mut.isPending} className="w-full rounded-xl">
                {mut.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate Email</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle asChild><h2>Generated Email</h2></CardTitle>
          </CardHeader>
          <CardContent>
            {mut.isPending ? (
              <div className="grid h-72 place-items-center text-muted-foreground">
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  <p className="mt-3 text-sm">AI is drafting your email...</p>
                </div>
              </div>
            ) : email ? (
              <div className="animate-fade-in space-y-4">
                <pre className="whitespace-pre-wrap rounded-xl bg-muted/50 p-4 text-sm font-sans leading-relaxed">{email}</pre>
                <div className="flex flex-wrap gap-2">
                  <Button variant="default" size="sm" onClick={copy} className="rounded-xl"><Copy className="mr-2 h-4 w-4" /> Copy</Button>
                  <Button variant="outline" size="sm" onClick={() => mut.mutate(form)} disabled={mut.isPending} className="rounded-xl"><RefreshCw className="mr-2 h-4 w-4" /> Regenerate</Button>
                  <Button variant="ghost" size="sm" onClick={clear} className="rounded-xl"><Trash2 className="mr-2 h-4 w-4" /> Clear</Button>
                </div>
              </div>
            ) : (
              <div className="grid h-72 place-items-center text-center text-sm text-muted-foreground">
                Your generated email will appear here.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}