import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: () => (
    <div className="grid h-full place-items-center rounded-2xl border bg-card text-sm text-muted-foreground">
      Select or create a conversation to start chatting.
    </div>
  ),
});