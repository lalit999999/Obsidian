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
import { Spinner } from "@/components/ui/spinner";
import type { Chat, Document, Message, Project } from "@/types";
import { ChatContainer } from "@/components/chat/chat-container";
import { ChatSidebar } from "./chat-sidebar";
import { DocumentsPanel } from "./documents-panel";

interface ProjectWorkspaceProps {
  project: Project;
  initialChats: Chat[];
  initialDocuments: Document[];
  initialActiveChatId: string | null;
  initialMessages: Message[];
}

export function ProjectWorkspace({
  project,
  initialChats,
  initialDocuments,
  initialActiveChatId,
  initialMessages,
}: ProjectWorkspaceProps) {
  const [chats, setChats] = useState(initialChats);
  const [documents, setDocuments] = useState(initialDocuments);
  const [activeChatId, setActiveChatId] = useState<string | null>(
    initialActiveChatId,
  );
  const [messagesByChatId, setMessagesByChatId] = useState<
    Record<string, Message[]>
  >(initialActiveChatId ? { [initialActiveChatId]: initialMessages } : {});
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [mobileChatsOpen, setMobileChatsOpen] = useState(false);
  const [mobileDocsOpen, setMobileDocsOpen] = useState(false);

  useEffect(() => {
    setChats(initialChats);
    setDocuments(initialDocuments);
    setActiveChatId(initialActiveChatId);
    setMessagesByChatId(
      initialActiveChatId ? { [initialActiveChatId]: initialMessages } : {},
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId),
    [activeChatId, chats],
  );

  const activeMessages = activeChatId
    ? (messagesByChatId[activeChatId] ?? [])
    : [];

  const loadMessages = async (chatId: string) => {
    if (messagesByChatId[chatId]) {
      return;
    }

    setIsLoadingMessages(true);
    setMessagesError(null);

    try {
      const response = await fetch(`/api/chats/${chatId}`);
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(
          payload?.error?.message ?? "Failed to load messages.",
        );
      }

      setMessagesByChatId((current) => ({
        ...current,
        [chatId]: payload.data.chat.messages as Message[],
      }));
    } catch (error) {
      setMessagesError(
        error instanceof Error ? error.message : "Failed to load messages.",
      );
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const selectChat = (chatId: string) => {
    setActiveChatId(chatId);
    void loadMessages(chatId);
  };

  const createChat = async () => {
    const response = await fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: project.id }),
    });

    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload?.error?.message ?? "Failed to create chat.");
    }

    const newChat = payload.data.chat as Chat;
    setChats((current) => [newChat, ...current]);
    setMessagesByChatId((current) => ({ ...current, [newChat.id]: [] }));
    setActiveChatId(newChat.id);
  };

  const renameChat = async (chatId: string) => {
    const currentChat = chats.find((chat) => chat.id === chatId);
    if (!currentChat) {
      return;
    }

    const nextTitle = window.prompt("Rename chat", currentChat.title)?.trim();
    if (!nextTitle) {
      return;
    }

    const response = await fetch(`/api/chats/${chatId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: nextTitle }),
    });

    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload?.error?.message ?? "Failed to rename chat.");
    }

    setChats((current) =>
      current.map((chat) => (chat.id === chatId ? payload.data.chat : chat)),
    );
  };

  const deleteChat = async (chatId: string) => {
    const response = await fetch(`/api/chats/${chatId}`, { method: "DELETE" });
    const payload = await response.json();

    if (!response.ok || !payload.success) {
      throw new Error(payload?.error?.message ?? "Failed to delete chat.");
    }

    setChats((current) => current.filter((chat) => chat.id !== chatId));
    setMessagesByChatId((current) => {
      const next = { ...current };
      delete next[chatId];
      return next;
    });
    setActiveChatId((current) => (current === chatId ? null : current));
  };

  const uploadDocument = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`/api/projects/${project.id}/documents`, {
      method: "POST",
      body: formData,
    });

    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload?.error?.message ?? "Failed to upload document.");
    }

    setDocuments((current) => [payload.data.document as Document, ...current]);
  };

  const deleteDocument = async (documentId: string) => {
    const response = await fetch(`/api/documents/${documentId}`, {
      method: "DELETE",
    });

    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload?.error?.message ?? "Failed to delete document.");
    }

    setDocuments((current) =>
      current.filter((document) => document.id !== documentId),
    );
  };

  const handleChatTitleChange = (chatId: string, title: string) => {
    setChats((current) =>
      current.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title,
              updatedAt: new Date().toISOString(),
            }
          : chat,
      ),
    );
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
      <div className="hidden xl:block">
        <ChatSidebar
          chats={chats}
          activeChatId={activeChat?.id ?? null}
          onSelectChat={selectChat}
          onCreateChat={createChat}
          onRenameChat={renameChat}
          onDeleteChat={deleteChat}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 rounded-3xl border bg-card/90 px-4 py-3 xl:hidden">
          <div>
            <p className="text-sm text-muted-foreground">Workspace panels</p>
            <p className="font-medium"></p>
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
                      selectChat(chatId);
                      setMobileChatsOpen(false);
                    }}
                    onCreateChat={createChat}
                    onRenameChat={renameChat}
                    onDeleteChat={deleteChat}
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

        {messagesError ? (
          <p className="text-sm text-destructive">{messagesError}</p>
        ) : null}

        {isLoadingMessages ? (
          <Card className="flex h-full min-h-[calc(100vh-10rem)] flex-col items-center justify-center gap-3 border-border/80 bg-card/90 text-sm text-muted-foreground">
            <Spinner className="size-6" />
            Loading conversation…
          </Card>
        ) : (
          <ChatContainer
            activeChat={activeChat}
            messages={activeMessages}
            key={activeChat?.id ?? "no-chat"}
            onChatUpdated={handleChatTitleChange}
            onOpenChats={() => setMobileChatsOpen(true)}
            onOpenDocuments={() => setMobileDocsOpen(true)}
          />
        )}
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
