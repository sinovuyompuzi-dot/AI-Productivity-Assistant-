import { createFileRoute, Outlet, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chat")({
  component: ChatLayout,
});

type Thread = { id: string; title: string; updated_at: string };

function ChatLayout() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { threadId?: string };

  async function loadThreads() {
    const { data, error } = await supabase
      .from("chat_threads")
      .select("id,title,updated_at")
      .order("updated_at", { ascending: false });
    if (error) {
      toast.error("Couldn't load conversations");
      return;
    }
    setThreads(data ?? []);
    setLoading(false);
    return data ?? [];
  }

  useEffect(() => {
    void (async () => {
      const list = await loadThreads();
      if (list && list.length === 0 && !params.threadId) {
        await createThread(true);
      } else if (list && list.length > 0 && !params.threadId) {
        navigate({ to: "/chat/$threadId", params: { threadId: list[0].id }, replace: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createThread(replace = false) {
    setCreating(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({ user_id: u.user.id, title: "New chat" })
      .select("id,title,updated_at")
      .single();
    setCreating(false);
    if (error || !data) {
      toast.error("Couldn't create conversation");
      return;
    }
    setThreads((t) => [data, ...t]);
    navigate({ to: "/chat/$threadId", params: { threadId: data.id }, replace });
  }

  async function deleteThread(id: string) {
    const { error } = await supabase.from("chat_threads").delete().eq("id", id);
    if (error) return toast.error("Couldn't delete");
    setThreads((t) => t.filter((x) => x.id !== id));
    if (params.threadId === id) {
      const remaining = threads.filter((x) => x.id !== id);
      if (remaining.length > 0) {
        navigate({ to: "/chat/$threadId", params: { threadId: remaining[0].id }, replace: true });
      } else {
        await createThread(true);
      }
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[260px_minmax(0,1fr)] h-[calc(100vh-8rem)]">
      <aside className="flex flex-col rounded-2xl border bg-card p-3 min-h-0">
        <Button onClick={() => createThread(false)} disabled={creating} className="mb-3 rounded-xl">
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          <span className="ml-2">New chat</span>
        </Button>
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground px-2 pb-2">
          Conversations
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {loading ? (
            <div className="p-3 text-sm text-muted-foreground">Loading…</div>
          ) : threads.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground">No conversations yet</div>
          ) : (
            threads.map((t) => {
              const active = params.threadId === t.id;
              return (
                <div
                  key={t.id}
                  className={cn(
                    "group flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm transition-colors",
                    active ? "bg-primary/10 text-foreground" : "hover:bg-accent",
                  )}
                >
                  <Link
                    to="/chat/$threadId"
                    params={{ threadId: t.id }}
                    className="flex flex-1 items-center gap-2 min-w-0"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{t.title || "Untitled"}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => deleteThread(t.id)}
                    aria-label="Delete conversation"
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>
      <section className="min-h-0 min-w-0">
        <Outlet />
      </section>
    </div>
  );
}

export function useRefreshThreads() {
  // helper hook placeholder if needed later
}