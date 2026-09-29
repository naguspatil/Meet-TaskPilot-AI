import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize GoogleGenAI instance if key is present
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API: Parse task from natural language
app.post("/api/gemini/parse-task", async (req, res) => {
  try {
    const { input } = req.body;
    if (!input || typeof input !== "string") {
      return res.status(400).json({ error: "Input prompt is required." });
    }

    const ai = getGenAI();
    if (!ai) {
      // Fallback heuristics if API key is not configured
      const isHigh = /high|urgent|asap|critical|important/i.test(input);
      const isLow = /low|whenever|someday/i.test(input);
      const priority = isHigh ? "high" : isLow ? "low" : "medium";

      let category = "Work";
      if (/grocer|dinner|doctor|workout|health|run|gym/i.test(input)) {
        category = /grocer|dinner|personal/i.test(input) ? "Personal" : "Health";
      } else if (/design|ui|token|ux|feature|spec|product/i.test(input)) {
        category = "Product";
      }

      return res.json({
        title: input.replace(/^(remind me to|schedule|add task|create task|todo:?)\s*/i, "").slice(0, 60),
        description: `Parsed from voice input: "${input}"`,
        date: "Tomorrow, Oct 25",
        time: "10:00 AM",
        priority,
        category,
        reminder: "15 minutes before",
        confidence: "98% confidence",
        entities: [
          { label: "Task", value: input.replace(/^(remind me to|schedule|add task)\s*/i, "").slice(0, 30) },
          { label: "Date", value: "Tomorrow (Oct 25)" },
          { label: "Time", value: "10:00 AM" },
          { label: "Priority", value: isHigh ? "High Priority" : "Medium Priority" },
          { label: "Reminder", value: "15m before" },
        ],
        subtasks: [
          { title: "Review prerequisites & data inputs", estMinutes: 15 },
          { title: "Execute main task deliverables", estMinutes: 30 },
          { title: "Perform final review and handoff", estMinutes: 15 },
        ],
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `You are an intelligent task parsing engine. Extract structured task properties from the following natural language request:\n"${input}"\nCurrent date is Thursday, Oct 24, 2026. Return a valid JSON matching the schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Clear, concise imperative task title" },
            description: { type: Type.STRING, description: "Helpful contextual summary or requirements" },
            date: { type: Type.STRING, description: "Friendly relative or absolute date, e.g. 'Tomorrow, Oct 25'" },
            time: { type: Type.STRING, description: "Scheduled time, e.g. '10:00 AM' or '3:30 PM'" },
            priority: { type: Type.STRING, description: "'low', 'medium', or 'high'" },
            category: { type: Type.STRING, description: "'Work', 'Product', 'Personal', or 'Health'" },
            reminder: { type: Type.STRING, description: "'15 minutes before', '30 minutes before', '1 hour before', or 'At time of due date'" },
            confidence: { type: Type.STRING, description: "e.g. '100% confidence' or '95% confidence'" },
            entities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                },
                required: ["label", "value"],
              },
            },
            subtasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  estMinutes: { type: Type.INTEGER },
                },
                required: ["title", "estMinutes"],
              },
            },
          },
          required: ["title", "description", "date", "time", "priority", "category", "reminder", "confidence", "entities", "subtasks"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error parsing task with Gemini:", error);
    return res.status(500).json({ error: error.message || "Failed to parse task" });
  }
});

// API: Decompose task into milestones / subtasks
app.post("/api/gemini/subtasks", async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Task title is required." });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        subtasks: [
          { title: `Research prerequisites and background data for ${title}`, estMinutes: 15, autoVerified: true },
          { title: "Draft core outline and key milestones", estMinutes: 20, autoVerified: false },
          { title: "Produce draft deliverables and review numbers", estMinutes: 30, autoVerified: false },
          { title: "Conduct quality check and stakeholder verification", estMinutes: 15, autoVerified: false },
          { title: "Final wrap-up, rehearsal, and archival", estMinutes: 15, autoVerified: false },
        ],
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Deconstruct this task into 4 to 6 actionable, sequential milestones with realistic minute estimates:
Title: "${title}"
Description: "${description || ""}"
Return JSON matching schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  estMinutes: { type: Type.INTEGER },
                  autoVerified: { type: Type.BOOLEAN },
                  note: { type: Type.STRING },
                },
                required: ["title", "estMinutes"],
              },
            },
          },
          required: ["subtasks"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return res.json(result);
  } catch (error: any) {
    console.error("Error generating subtasks with Gemini:", error);
    return res.status(500).json({ error: error.message || "Failed to generate subtasks" });
  }
});

// API: TaskAI Copilot Chat
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, currentTasks, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getGenAI();
    if (!ai) {
      // Heuristic fallback response with rich actionable widgets
      const lower = message.toLowerCase();
      if (lower.includes("focus") || lower.includes("presentation") || lower.includes("break down")) {
        return res.json({
          reply: "Good morning Sarah! Looking at your tasks today, here is your optimal AI-curated focus plan:",
          recommendedTask: {
            id: "task-1",
            title: "Finalize Q3 Financial Report",
            priority: "High",
            time: "1:30 PM",
            whyFirst: "Takes the most cognitive load; do this before your 2:00 PM executive sync to eliminate friction.",
          },
          breakdown: {
            taskTitle: "Prepare Executive Presentation",
            subtasks: [
              { id: "sb-1", title: "Research market benchmark data", est: "15m" },
              { id: "sb-2", title: "Create storyline outline & key takeaways", est: "20m" },
              { id: "sb-3", title: "Design 8 slide visual deck", est: "45m" },
              { id: "sb-4", title: "Review citations & financial numbers", est: "15m" },
              { id: "sb-5", title: "Rehearse pitch & time speaker notes", est: "15m" },
            ],
          },
          calendarProposal: {
            prompt: "Would you like me to block 10:00 AM – 11:30 AM on your calendar for this deep work block?",
            startTime: "10:00 AM",
            endTime: "11:30 AM",
          },
        });
      }

      if (lower.includes("overdue") || lower.includes("unfinished") || lower.includes("tomorrow")) {
        return res.json({
          reply: "I found 1 overdue task ('Submit expense receipts for October'). I recommend auto-rescheduling it to today at 4:00 PM right after your sync.",
          rescheduleSuggestion: {
            taskTitle: "Submit expense receipts for October",
            newTime: "Today, 4:00 PM",
          },
        });
      }

      return res.json({
        reply: `I've analyzed your schedule and active priorities regarding "${message}". Your afternoon is clear between 2:30 PM and 4:30 PM for high-focus deep work. Let me know if you would like me to adjust any deadlines!`,
      });
    }

    // Call Gemini 3.8 Flash
    const systemPrompt = `You are TaskAI Copilot, an elite personal productivity and executive assistant.
You help Sarah optimize her day, manage cognitive load, sequence tasks, and time-block deep work.
Always be encouraging, crisp, professional, and action-oriented.
When the user asks what to focus on or to break down tasks, provide clear cognitive reasoning ("Why first"), actionable breakdown steps, and calendar recommendations.
Context:
Current tasks: ${JSON.stringify(currentTasks || [])}
Return a JSON object matching the provided schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\nUser request: "${message}"` }] },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING, description: "Conversational response prose" },
            recommendedTask: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                priority: { type: Type.STRING },
                time: { type: Type.STRING },
                whyFirst: { type: Type.STRING },
              },
            },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                taskTitle: { type: Type.STRING },
                subtasks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      est: { type: Type.STRING },
                    },
                    required: ["title", "est"],
                  },
                },
              },
            },
            calendarProposal: {
              type: Type.OBJECT,
              properties: {
                prompt: { type: Type.STRING },
                startTime: { type: Type.STRING },
                endTime: { type: Type.STRING },
              },
            },
          },
          required: ["reply"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    return res.json(data);
  } catch (error: any) {
    console.error("Error in TaskAI Copilot chat:", error);
    return res.status(500).json({ error: error.message || "Failed to process chat" });
  }
});

// Vite Middleware for development / static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`TaskAI server running on http://localhost:${PORT}`);
  });
}

startServer();
