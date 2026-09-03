import type { Chat, Document, Message, Project, User } from "@/types";

const now = new Date("2026-09-03T10:00:00.000Z");

const daysAgo = (days: number) =>
  new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

const hoursAgo = (hours: number) =>
  new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();

export const mockUser: User = {
  id: "user-demo",
  name: "Maya Chen",
  email: "maya@obsidian.ai",
  image:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
  createdAt: daysAgo(120),
};

export const mockProjects: Project[] = [
  {
    id: "project-javascript-notes",
    name: "JavaScript Notes",
    description:
      "A living reference for event loop behavior, async patterns, and language fundamentals.",
    userId: mockUser.id,
    documentCount: 4,
    chatCount: 3,
    createdAt: daysAgo(32),
    updatedAt: hoursAgo(6),
  },
  {
    id: "project-redis-knowledge-base",
    name: "Redis Knowledge Base",
    description:
      "Practical Redis docs, caching notes, and command snippets for day-to-day engineering work.",
    userId: mockUser.id,
    documentCount: 3,
    chatCount: 2,
    createdAt: daysAgo(25),
    updatedAt: daysAgo(1),
  },
  {
    id: "project-nextjs-documentation",
    name: "Next.js Documentation",
    description:
      "Architecture notes, routing patterns, and deployment reminders for the app router.",
    userId: mockUser.id,
    documentCount: 5,
    chatCount: 4,
    createdAt: daysAgo(18),
    updatedAt: hoursAgo(14),
  },
  {
    id: "project-ai-learning-notes",
    name: "AI Learning Notes",
    description:
      "Prompting tips, RAG ideas, and model behavior observations captured during experimentation.",
    userId: mockUser.id,
    documentCount: 2,
    chatCount: 1,
    createdAt: daysAgo(8),
    updatedAt: hoursAgo(22),
  },
];

export const mockDocuments: Document[] = [
  {
    id: "doc-js-event-loop",
    projectId: "project-javascript-notes",
    userId: mockUser.id,
    fileName: "event-loop-cheatsheet.md",
    fileSize: 18_240,
    mimeType: "text/markdown",
    status: "READY",
    error: null,
    chunkCount: 12,
    createdAt: daysAgo(31),
  },
  {
    id: "doc-js-async",
    projectId: "project-javascript-notes",
    userId: mockUser.id,
    fileName: "async-patterns.txt",
    fileSize: 7_842,
    mimeType: "text/plain",
    status: "PROCESSING",
    error: null,
    chunkCount: 4,
    createdAt: hoursAgo(3),
  },
  {
    id: "doc-js-failed",
    projectId: "project-javascript-notes",
    userId: mockUser.id,
    fileName: "prototype-notes.md",
    fileSize: 12_004,
    mimeType: "text/markdown",
    status: "FAILED",
    error: "File contained an unsupported frontmatter block.",
    chunkCount: 0,
    createdAt: daysAgo(20),
  },
  {
    id: "doc-js-pending",
    projectId: "project-javascript-notes",
    userId: mockUser.id,
    fileName: "closures.txt",
    fileSize: 6_412,
    mimeType: "text/plain",
    status: "PENDING",
    error: null,
    chunkCount: 0,
    createdAt: hoursAgo(1),
  },
  {
    id: "doc-redis-cache",
    projectId: "project-redis-knowledge-base",
    userId: mockUser.id,
    fileName: "redis-cache-basics.md",
    fileSize: 24_108,
    mimeType: "text/markdown",
    status: "READY",
    error: null,
    chunkCount: 16,
    createdAt: daysAgo(24),
  },
  {
    id: "doc-next-routing",
    projectId: "project-nextjs-documentation",
    userId: mockUser.id,
    fileName: "app-router-guide.md",
    fileSize: 30_842,
    mimeType: "text/markdown",
    status: "READY",
    error: null,
    chunkCount: 21,
    createdAt: daysAgo(17),
  },
  {
    id: "doc-ai-prompting",
    projectId: "project-ai-learning-notes",
    userId: mockUser.id,
    fileName: "prompting-notes.txt",
    fileSize: 9_120,
    mimeType: "text/plain",
    status: "READY",
    error: null,
    chunkCount: 7,
    createdAt: daysAgo(7),
  },
];

export const mockChats: Chat[] = [
  {
    id: "chat-js-1",
    projectId: "project-javascript-notes",
    userId: mockUser.id,
    title: "Event loop deep dive",
    createdAt: daysAgo(21),
    updatedAt: hoursAgo(6),
  },
  {
    id: "chat-js-2",
    projectId: "project-javascript-notes",
    userId: mockUser.id,
    title: "Async/await summary",
    createdAt: daysAgo(14),
    updatedAt: daysAgo(2),
  },
  {
    id: "chat-js-3",
    projectId: "project-javascript-notes",
    userId: mockUser.id,
    title: "Closures explained simply",
    createdAt: daysAgo(5),
    updatedAt: hoursAgo(13),
  },
  {
    id: "chat-next-1",
    projectId: "project-nextjs-documentation",
    userId: mockUser.id,
    title: "App router questions",
    createdAt: daysAgo(10),
    updatedAt: hoursAgo(14),
  },
];

export const mockMessages: Message[] = [
  {
    id: "msg-js-1",
    chatId: "chat-js-1",
    role: "USER",
    content: "Summarize how the event loop fits into async JavaScript.",
    createdAt: hoursAgo(6),
  },
  {
    id: "msg-js-2",
    chatId: "chat-js-1",
    role: "ASSISTANT",
    content:
      "The event loop is the coordinator that keeps JavaScript responsive. It moves completed callbacks from task queues back onto the call stack, which is why timers, promises, and I/O each feel asynchronous even though the runtime executes one thing at a time.",
    sources: ["event-loop-cheatsheet.md", "async-patterns.txt"],
    createdAt: hoursAgo(6),
  },
  {
    id: "msg-js-3",
    chatId: "chat-js-1",
    role: "USER",
    content: "Give me a one-paragraph explanation I can paste into my notes.",
    createdAt: hoursAgo(5),
  },
  {
    id: "msg-js-4",
    chatId: "chat-js-1",
    role: "ASSISTANT",
    content:
      "JavaScript runs on a single call stack, so async work is handled by the runtime and returned to the stack later through the event loop. Promise callbacks are scheduled as microtasks and usually run before timers, which is why async/await feels immediate even when the underlying work finishes later.",
    sources: ["event-loop-cheatsheet.md"],
    createdAt: hoursAgo(5),
  },
  {
    id: "msg-next-1",
    chatId: "chat-next-1",
    role: "USER",
    content: "What should I remember about the Next.js app router?",
    createdAt: hoursAgo(15),
  },
  {
    id: "msg-next-2",
    chatId: "chat-next-1",
    role: "ASSISTANT",
    content:
      "Think in nested layouts and route segments. Server components are the default, client components are only for interactivity, and the file system defines the route shape, so the most maintainable apps keep shared chrome in layouts and page-specific UI close to the route.",
    sources: ["app-router-guide.md"],
    createdAt: hoursAgo(15),
  },
];

export const mockStatistics = {
  totalProjects: mockProjects.length,
  totalDocuments: mockDocuments.length,
  totalChats: mockChats.length,
};

export const mockProjectById = mockProjects.reduce<Record<string, Project>>(
  (accumulator, project) => {
    accumulator[project.id] = project;
    return accumulator;
  },
  {},
);

export const mockDocumentsByProjectId = mockProjects.reduce<
  Record<string, Document[]>
>((accumulator, project) => {
  accumulator[project.id] = mockDocuments.filter(
    (document) => document.projectId === project.id,
  );
  return accumulator;
}, {});

export const mockChatsByProjectId = mockProjects.reduce<Record<string, Chat[]>>(
  (accumulator, project) => {
    accumulator[project.id] = mockChats.filter(
      (chat) => chat.projectId === project.id,
    );
    return accumulator;
  },
  {},
);

export const mockMessagesByChatId = mockChats.reduce<Record<string, Message[]>>(
  (accumulator, chat) => {
    accumulator[chat.id] = mockMessages.filter(
      (message) => message.chatId === chat.id,
    );
    return accumulator;
  },
  {},
);
