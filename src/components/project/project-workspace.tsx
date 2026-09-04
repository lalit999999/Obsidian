"use client";

import { useEffect, useMemo, useState } from "react";
import { PanelLeftOpen, PanelRightOpen } from "lucide-react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Chat, Document, Message, Project } from "@/types";
import type { SendMessageResponse } from "@/types/chat";
import { ChatContainer } from "@/components/chat/chat-container";
import { ProjectHeader } from "./project-header";
import { ChatSidebar } from "./chat-sidebar";
import { DocumentsPanel } from "./documents-panel";
import { DocumentPreviewDialog } from "./document-preview-dialog";

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
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(
    null,
  );
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(
    null,
  );

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

  const createChat = async (): Promise<Chat> => {
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

    return newChat;
  };

  const ensureActiveChat = async (): Promise<Chat> => {
    if (activeChat) {
      return activeChat;
    }

    setIsCreatingChat(true);
    try {
      return await createChat();
    } finally {
      setIsCreatingChat(false);
    }
  };

  const canCreateChat = !isCreatingChat;

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isSendingMessage) {
      return;
    }

    setIsSendingMessage(true);
    setSendError(null);
    setLastFailedMessage(null);

    let chat: Chat;
    try {
      chat = await ensureActiveChat();
    } catch (error) {
      setSendError(
        error instanceof Error ? error.message : "Failed to start a new chat.",
      );
      setLastFailedMessage(trimmed);
      setIsSendingMessage(false);
      return;
    }

    const chatId = chat.id;
    const temporaryUserMessage: Message = {
      id: `temp-${Date.now()}`,
      chatId,
      role: "USER",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessagesByChatId((current) => ({
      ...current,
      [chatId]: [...(current[chatId] ?? []), temporaryUserMessage],
    }));

    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      let payload:
        | SendMessageResponse
        | { success: false; error?: { message?: string } };

      try {
        payload = await response.json();
      } catch {
        throw new Error(
          `Failed to send message (server returned ${response.status}).`,
        );
      }

      if (!response.ok || !payload.success) {
        const serverMessage =
          "error" in payload ? payload.error?.message : undefined;
        throw new Error(serverMessage ?? "Failed to send message.");
      }

      setMessagesByChatId((current) => ({
        ...current,
        [chatId]: [
          ...(current[chatId] ?? []).filter(
            (message) => message.id !== temporaryUserMessage.id,
          ),
          payload.data.userMessage,
          payload.data.assistantMessage,
        ],
      }));

      if (chat.title === "New chat") {
        handleChatTitleChange(chatId, trimmed.slice(0, 120));
      }
    } catch (error) {
      setSendError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
      setLastFailedMessage(trimmed);
      setMessagesByChatId((current) => ({
        ...current,
        [chatId]: (current[chatId] ?? []).filter(
          (message) => message.id !== temporaryUserMessage.id,
        ),
      }));
    } finally {
      setIsSendingMessage(false);
    }
  };

  const retryLastMessage = () => {
    if (lastFailedMessage) {
      void sendMessage(lastFailedMessage);
    }
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
    toast.success("Document uploaded");
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
    setPreviewDocumentId((current) =>
      current === documentId ? null : current,
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

  const previewDocument = documents.find(
    (document) => document.id === previewDocumentId,
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-3">
      <ProjectHeader
        project={project}
        onOpenChats={() => setMobileChatsOpen(true)}
        onOpenDocuments={() => setMobileDocsOpen(true)}
      />

      <div className="flex h-full min-h-0 gap-3">
        <div
          className={
            "hidden min-h-0 shrink-0 overflow-hidden transition-[width] duration-200 motion-reduce:transition-none lg:block " +
            (leftCollapsed ? "w-9" : "w-65")
          }
        >
          {leftCollapsed ? (
            <button
              type="button"
              onClick={() => setLeftCollapsed(false)}
              aria-label="Expand chats panel"
              className="flex h-full w-9 items-center justify-center rounded-lg border bg-card/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <PanelLeftOpen className="size-4" />
            </button>
          ) : (
            <div className="h-full min-h-0 w-65">
              <ChatSidebar
                chats={chats}
                activeChatId={activeChat?.id ?? null}
                onSelectChat={(chatId) => {
                  selectChat(chatId);
                }}
                onCreateChat={createChat}
                onRenameChat={renameChat}
                onDeleteChat={deleteChat}
                onCollapse={() => setLeftCollapsed(true)}
              />
            </div>
          )}
        </div>

        <div className="min-h-0 min-w-0 flex-1">
          <ChatContainer
            activeChat={activeChat}
            messages={activeMessages}
            key={activeChat?.id ?? "no-chat"}
            isSending={isSendingMessage}
            isLoadingMessages={isLoadingMessages}
            messagesError={messagesError}
            onDismissMessagesError={() => setMessagesError(null)}
            error={sendError}
            onRetry={lastFailedMessage ? retryLastMessage : undefined}
            onSendMessage={sendMessage}
            onOpenChats={() => setMobileChatsOpen(true)}
            onOpenDocuments={() => setMobileDocsOpen(true)}
            onOpenSource={(documentId) => setPreviewDocumentId(documentId)}
            disabled={!activeChat && !canCreateChat}
          />
        </div>

        <div
          className={
            "hidden min-h-0 shrink-0 overflow-hidden transition-[width] duration-200 motion-reduce:transition-none lg:block " +
            (rightCollapsed ? "w-9" : "w-75")
          }
        >
          {rightCollapsed ? (
            <button
              type="button"
              onClick={() => setRightCollapsed(false)}
              aria-label="Expand sources panel"
              className="flex h-full w-9 items-center justify-center rounded-lg border bg-card/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <PanelRightOpen className="size-4" />
            </button>
          ) : (
            <div className="h-full min-h-0 w-75">
              <DocumentsPanel
                documents={documents}
                onUploadDocument={uploadDocument}
                onDeleteDocument={deleteDocument}
                onPreviewDocument={(documentId) =>
                  setPreviewDocumentId(documentId)
                }
                onCollapse={() => setRightCollapsed(true)}
              />
            </div>
          )}
        </div>
      </div>

      <Sheet open={mobileChatsOpen} onOpenChange={setMobileChatsOpen}>
        <SheetContent side="left" className="w-[min(22rem,100vw)] p-4">
          <SheetHeader>
            <SheetTitle>Chats</SheetTitle>
          </SheetHeader>
          <div className="mt-4 h-[calc(100dvh-6rem)] min-h-0">
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
        <SheetContent side="right" className="w-[min(22rem,100vw)] p-4">
          <SheetHeader>
            <SheetTitle>Documents</SheetTitle>
          </SheetHeader>
          <div className="mt-4 h-[calc(100dvh-6rem)] min-h-0">
            <DocumentsPanel
              documents={documents}
              onUploadDocument={uploadDocument}
              onDeleteDocument={deleteDocument}
              onPreviewDocument={(documentId) => {
                setPreviewDocumentId(documentId);
                setMobileDocsOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <DocumentPreviewDialog
        document={previewDocument ?? null}
        open={previewDocumentId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewDocumentId(null);
          }
        }}
        onDelete={deleteDocument}
      />
    </div>
  );
}
