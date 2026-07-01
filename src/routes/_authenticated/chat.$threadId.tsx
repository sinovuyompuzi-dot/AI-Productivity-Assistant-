import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  component: ChatThreadPage,
});

function ChatThreadPage() {
  const { threadId } = Route.useParams();
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const savedFirstUserRef = useRef(false);

  // Load auth token and existing messages when threadId changes
  useEffect(() => {
    savedFirstUserRef.current = false;
    setInitialMessages(null);
    void (async () => {
      const { data: sess } = await supabase.auth.getSession();
      setToken(sess.session?.access_token ?? null);
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id,role,parts,created_at")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      if (error) {
        toast.error("Couldn't load messages");
        setInitialMessages([]);
        return;
      }
      const msgs: UIMessage[] = (data ?? []).map((row) => ({
        id: row.id,
        role: row.role as UIMessage["role"],
        parts: row.parts as UIMessage["parts"],
      }));
      setInitialMessages(msgs);
      if (msgs.some((m) => m.role === "user")) savedFirstUserRef.current = true;
    })();
  }, [threadId]);

  const transport = useMemo(() => {
    if (!token) return null;
    return new DefaultChatTransport({
      api: "/api/chat",
      headers: { Authorization: `Bearer ${token}` },
    });
  }, [token]);

  if (!initialMessages || !transport) {
    return (
      <div className="grid h-full place-items-center rounded-2xl border bg-card text-sm text-muted-foreground">
        Loading conversation…
      </div>
    );
  }

  return (
    <ChatWindow
      key={threadId}
      threadId={threadId}
      transport={transport}
      initialMessages={initialMessages}
    />
  );
}

function ChatWindow({
  threadId,
  transport,
  initialMessages,
}: {
  threadId: string;
  transport: DefaultChatTransport<UIMessage>;
  initialMessages: UIMessage[];
}) {
  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (err) => {
      console.error(err);
      toast.error("Unable to generate a response at the moment. Please try again later.");
    },
    onFinish: async ({ message }) => {
      await persistMessage(threadId, message);
      await maybeUpdateTitle(threadId, messages);
    },
  });

  const isLoading = status === "submitted" || status === "streaming";
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId, status]);

  async function handleSubmit(msg: PromptInputMessage) {
    const text = (msg.text ?? "").trim();
    if (!text || isLoading) return;
    // optimistic persistence of user message
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      await supabase.from("chat_messages").insert({
        thread_id: threadId,
        user_id: u.user.id,
        role: "user",
        parts: [{ type: "text", text }],
      });
      await supabase
        .from("chat_threads")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", threadId);
    }
    await sendMessage({ text });
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border bg-card overflow-hidden">
      <Conversation className="flex-1 min-h-0">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<Sparkles className="h-8 w-8 text-primary" />}
              title="How can I help you today?"
              description="Ask about drafting emails, summarizing notes, planning your day, or anything work-related."
            />
          ) : (
            messages.map((m) => (
              <Message key={m.id} from={m.role}>
                <MessageContent>
                  {m.parts.map((part, i) => {
                    if (part.type === "text") {
                      return m.role === "assistant" ? (
                        <MessageResponse key={i}>{part.text}</MessageResponse>
                      ) : (
                        <div key={i} className="whitespace-pre-wrap">
                          {part.text}
                        </div>
                      );
                    }
                    return null;
                  })}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>Thinking…</Shimmer>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <PromptInput onSubmit={handleSubmit} className="m-3">
        <PromptInputTextarea ref={textareaRef} placeholder="Message your AI assistant…" />
        <PromptInputFooter className="justify-end">
          <PromptInputSubmit status={status} disabled={isLoading} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}

async function persistMessage(threadId: string, message: UIMessage) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  await supabase.from("chat_messages").insert({
    thread_id: threadId,
    user_id: u.user.id,
    role: message.role,
    parts: message.parts,
  });
  await supabase
    .from("chat_threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", threadId);
}

async function maybeUpdateTitle(threadId: string, messages: UIMessage[]) {
  const { data: thread } = await supabase
    .from("chat_threads")
    .select("title")
    .eq("id", threadId)
    .single();
  if (!thread || thread.title !== "New chat") return;
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return;
  const text = firstUser.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join(" ")
    .trim();
  if (!text) return;
  const title = text.length > 60 ? text.slice(0, 57) + "…" : text;
  await supabase.from("chat_threads").update({ title }).eq("id", threadId);
}