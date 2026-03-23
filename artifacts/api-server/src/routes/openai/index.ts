import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, conversations, messages } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  CreateOpenaiConversationBody,
  SendOpenaiMessageBody,
  GenerateOpenaiImageBody,
} from "@workspace/api-zod";
import { getDrMotierSystemPrompt } from "../../lib/drMotier";

const router: IRouter = Router();


router.get("/conversations", async (_req: Request, res: Response) => {
  const convos = await db
    .select()
    .from(conversations)
    .orderBy(conversations.createdAt);
  res.json(convos);
});

router.post("/conversations", async (req: Request, res: Response) => {
  const body = CreateOpenaiConversationBody.parse(req.body);
  const [convo] = await db
    .insert(conversations)
    .values({ title: body.title })
    .returning();
  res.status(201).json(convo);
});

router.get("/conversations/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const [convo] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));

  if (!convo) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt);

  res.json({ ...convo, messages: msgs });
});

router.delete("/conversations/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const [convo] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));

  if (!convo) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  await db.delete(conversations).where(eq(conversations.id, id));
  res.status(204).end();
});

router.get("/conversations/:id/messages", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt);
  res.json(msgs);
});

router.post("/conversations/:id/messages", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const body = SendOpenaiMessageBody.parse(req.body);

  const [convo] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));

  if (!convo) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  await db.insert(messages).values({
    conversationId: id,
    role: "user",
    content: body.content,
  });

  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt);

  const chatMessages = [
    { role: "system" as const, content: getDrMotierSystemPrompt() },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  const stream = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: chatMessages,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      fullResponse += content;
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
  }

  await db.insert(messages).values({
    conversationId: id,
    role: "assistant",
    content: fullResponse,
  });

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

router.post("/generate-image", async (req: Request, res: Response) => {
  const body = GenerateOpenaiImageBody.parse(req.body);
  const { generateImageBuffer } = await import(
    "@workspace/integrations-openai-ai-server/image"
  );
  const buffer = await generateImageBuffer(body.prompt, (body.size as "1024x1024" | "512x512" | "256x256") ?? "1024x1024");
  res.json({ b64_json: buffer.toString("base64") });
});

export default router;
