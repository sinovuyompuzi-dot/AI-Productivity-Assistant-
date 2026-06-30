import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(MODEL);
}

function handleError(e: unknown): never {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes("429")) throw new Error("Rate limit exceeded. Please wait and try again.");
  if (msg.includes("402")) throw new Error("AI credits exhausted. Please add credits in your workspace billing.");
  throw new Error(msg || "AI request failed");
}

const EmailInput = z.object({
  recipientType: z.enum(["Client", "Manager", "Team Member"]),
  subject: z.string().min(1),
  purpose: z.string().min(1),
  tone: z.enum(["Formal", "Friendly", "Persuasive"]),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    try {
      const { text } = await generateText({
        model: getModel(),
        system:
          "You are a professional workplace email writer. Write clear, well-structured emails ready to send. Include greeting, body, and sign-off. Return ONLY the email body, no commentary or markdown.",
        prompt: `Write an email with these details:
- Recipient: ${data.recipientType}
- Subject: ${data.subject}
- Purpose: ${data.purpose}
- Tone: ${data.tone}`,
      });
      return { email: text };
    } catch (e) {
      handleError(e);
    }
  });

const NotesInput = z.object({ notes: z.string().min(10) });

const NotesSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  decisions: z.array(z.string()),
  actionItems: z.array(z.string()),
  deadlines: z.array(z.string()),
  responsiblePersons: z.array(z.string()),
});

export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => NotesInput.parse(d))
  .handler(async ({ data }) => {
    try {
      const { output } = await generateText({
        model: getModel(),
        output: Output.object({ schema: NotesSchema }),
        system:
          "You are an expert meeting analyst. Extract structured information from meeting notes. If a section has no info, return an empty array (or 'Not specified' for summary).",
        prompt: `Analyze these meeting notes and extract structured information:\n\n${data.notes}`,
      });
      return output;
    } catch (e) {
      handleError(e);
    }
  });

const PlannerInput = z.object({
  workingHours: z.string().min(1),
  tasks: z.string().min(1),
  priority: z.string().min(1),
});

const PlannerSchema = z.object({
  todos: z.array(z.string()),
  schedule: z.array(z.object({ time: z.string(), task: z.string() })),
  timeBlocks: z.array(z.string()),
  breaks: z.array(z.string()),
  tips: z.array(z.string()),
});

export const generateSchedule = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PlannerInput.parse(d))
  .handler(async ({ data }) => {
    try {
      const { output } = await generateText({
        model: getModel(),
        output: Output.object({ schema: PlannerSchema }),
        system:
          "You are a productivity coach. Create a realistic, prioritized daily plan with time blocks, breaks, and actionable tips.",
        prompt: `Create a daily schedule:
- Working hours: ${data.workingHours}
- Tasks: ${data.tasks}
- Highest priority: ${data.priority}

Return a prioritized to-do list, an hour-by-hour schedule, focused time blocks, break times, and productivity tips.`,
      });
      return output;
    } catch (e) {
      handleError(e);
    }
  });