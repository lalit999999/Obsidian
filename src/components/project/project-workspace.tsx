"use client";

import { useEffect, useMemo, useState } from "react";
import { PanelLeft, PanelRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Chat, Document, Message, Project, User } from "@/types";
import { ChatContainer } from "@/components/chat/chat-container";
import { ChatSidebar } from "./chat-sidebar";
import { DocumentsPanel } from "./documents-panel";

interface ProjectWorkspaceProps {
  project: Project;
  user: User;
  initialChats: Chat[];
  initialMessages: Message[];
  initialDocuments: Document[];
}

function buildAssistantResponse(
  question: string,
  project: Project,
  documents: Document[],
) {
  const readyDocs = documents
    .filter((document) => document.status === "READY")
    .slice(0, 3);
  const summary = readyDocs.length
    ? `I looked at ${readyDocs.map((document) => document.fileName).join(", ")} and pulled together the most relevant notes.`
    : "I do not have any ready documents to reference yet, but the workspace is ready for more notes.";

  return `${summary} You asked: “${question}”. For ${project.name}, a good next step is to break the topic into smaller questions and save the useful parts back into your notes.`;
}

export function ProjectWorkspace({
  project,
  user,
  initialChats,
  initialMessages,
  initialDocuments,
}: ProjectWorkspaceProps) {
  const [chats, setChats] = useState(initialChats);
  const [documents, setDocuments] = useState(initialDocuments);
  const [messages, setMessages] = useState(initialMessages);
  const [activeChatId, setActiveChatId] = useState<string | null>(
    initialChats[0]?.id ?? null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [mobileChatsOpen, setMobileChatsOpen] = useState(false);
  const [mobileDocsOpen, setMobileDocsOpen] = useState(false);

  useEffect(() => {
    setChats(initialChats);
    setDocuments(initialDocuments);
    setMessages(initialMessages);
    setActiveChatId(initialChats[0]?.id ?? null);
  }, [initialChats, initialDocuments, initialMessages, project.id]);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? chats[0],
    [activeChatId, chats],
  );

  const activeMessages = useMemo(
    () => messages.filter((message) => message.chatId === activeChat?.id),
    [activeChat?.id, messages],
  );

  const createChat = () => {
    const now = new Date().toISOString();
    const newChat: Chat = {
      id: `chat-${project.id}-${Date.now()}`,
      projectId: project.id,
      userId: user.id,
      title: "New chat",
      createdAt: now,
      updatedAt: now,
    };

    setChats((current) => [newChat, ...current]);
    setActiveChatId(newChat.id);
  };

  const sendMessage = (content: string) => {
    if (!activeChat) {
      return;
    }

    const now = new Date().toISOString();
    const userMessage: Message = {
      id: `message-${Date.now()}`,
      chatId: activeChat.id,
      role: "USER",
      content,
      createdAt: now,
    };

    setMessages((current) => [...current, userMessage]);
    setIsLoading(true);

    window.setTimeout(() => {
      const assistantMessage: Message = {
        id: `message-${Date.now()}-assistant`,
        chatId: activeChat.id,
        role: "ASSISTANT",
        content: buildAssistantResponse(content, project, documents),
        sources: documents
          .filter((document) => document.status === "READY")
          .slice(0, 3)
          .map((document) => document.fileName),
        createdAt: new Date().toISOString(),
      };

      setMessages((current) => [...current, assistantMessage]);
      setChats((current) =>
        current.map((chat) =>
          chat.id === activeChat.id
            ? {
                ...chat,
                updatedAt: new Date().toISOString(),
                title:
                  chat.title === "New chat" ? content.slice(0, 32) : chat.title,
              }
            : chat,
        ),
      );
      setIsLoading(false);
    }, 850);
  };

  const uploadDocument = (
    document: Omit<Document, "id" | "createdAt" | "projectId" | "userId">,
    fileName: string,
  ) => {
    const nextDocument: Document = {
      ...document,
      id: `document-${Date.now()}`,
      projectId: project.id,
      userId: user.id,
      fileName,
      createdAt: new Date().toISOString(),
    };

    setDocuments((current) => [nextDocument, ...current]);

    window.setTimeout(() => {
      setDocuments((current) =>
        current.map((item) =>
          item.id === nextDocument.id
            ? {
                ...item,
                status: Math.random() > 0.14 ? "READY" : "FAILED",
                chunkCount: Math.max(1, Math.ceil(item.fileSize / 1800)),
                error:
                  Math.random() > 0.14
                    ? null
                    : "Mock processing failed while parsing the document.",
              }
            : item,
        ),
      );
    }, 1500);
  };

  const deleteDocument = (documentId: string) => {
    setDocuments((current) =>
      current.filter((document) => document.id !== documentId),
    );
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
      <div className="hidden xl:block">
        <ChatSidebar
          chats={chats}
          activeChatId={activeChat?.id ?? null}
          onSelectChat={setActiveChatId}
          onCreateChat={createChat}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 rounded-3xl border bg-card/90 px-4 py-3 xl:hidden">
          <div>
            <p className="text-sm text-muted-foreground">Workspace panels</p>
            <p className="font-medium">
              Mobile uses sheets for chats and documents
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Sheet open={mobileChatsOpen} onOpenChange={setMobileChatsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <PanelLeft className="size-4" />
                  Chats
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(22rem,100vw)] p-4">
                <SheetHeader>
                  <SheetTitle>Chats</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <ChatSidebar
                    chats={chats}
                    activeChatId={activeChat?.id ?? null}
                    onSelectChat={(chatId) => {
                      setActiveChatId(chatId);
                      setMobileChatsOpen(false);
                    }}
                    onCreateChat={createChat}
                  />
                </div>
              </SheetContent>
            </Sheet>
            <Sheet open={mobileDocsOpen} onOpenChange={setMobileDocsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <PanelRight className="size-4" />
                  Docs
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(22rem,100vw)] p-4">
                <SheetHeader>
                  <SheetTitle>Documents</SheetTitle>
                </SheetHeader>
                <div className="mt-4 h-[calc(100vh-6rem)]">
                  <DocumentsPanel
                    documents={documents}
                    onUploadDocument={uploadDocument}
                    onDeleteDocument={deleteDocument}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <ChatContainer
          activeChat={activeChat}
          messages={activeMessages}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          onPromptSelect={sendMessage}
          onOpenChats={() => setMobileChatsOpen(true)}
          onOpenDocuments={() => setMobileDocsOpen(true)}
        />
      </div>

      <div className="hidden xl:block">
        <DocumentsPanel
          documents={documents}
          onUploadDocument={uploadDocument}
          onDeleteDocument={deleteDocument}
        />
      </div>
    </div>
  );
}



/**
 * PROJECT WORKSPACE
 *
 * Connect the three major sections of the project page:
 *
 * LEFT:
 * Chat sidebar
 *
 * CENTER:
 * AI chat
 *
 * RIGHT:
 * Document panel
 *
 * Responsibilities:
 *
 * - Receive project data.
 * - Manage active chat selection.
 * - Coordinate refreshes after chat/document mutations.
 * - Pass projectId to child components.
 *
 * Layout:
 *
 * ChatSidebar
 *      |
 *      | activeChatId
 *      v
 * ChatContainer
 *
 * DocumentPanel remains scoped to the same project.
 *
 * Keep this component focused on composition and state
 * coordination rather than business logic.
 */