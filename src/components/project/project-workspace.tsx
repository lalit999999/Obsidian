"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const DOCUMENT_POLL_INTERVAL_MS = 2500;
const SCOPE_PATCH_DEBOUNCE_MS = 400;

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
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>(
    () =>
      initialChats.find((chat) => chat.id === initialActiveChatId)
        ?.documentIds ?? [],
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

  const scopePatchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    setChats(initialChats);
    setDocuments(initialDocuments);
    setActiveChatId(initialActiveChatId);
    setSelectedDocumentIds(
      initialChats.find((chat) => chat.id === initialActiveChatId)
        ?.documentIds ?? [],
    );
    setMessagesByChatId(
      initialActiveChatId ? { [initialActiveChatId]: initialMessages } : {},
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  useEffect(() => {
    return () => {
      if (scopePatchTimeoutRef.current) {
        clearTimeout(scopePatchTimeoutRef.current);
      }
    };
  }, []);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId),
    [activeChatId, chats],
  );

  const activeMessages = activeChatId
    ? (messagesByChatId[activeChatId] ?? [])
    : [];

  const hasPendingDocuments = documents.some(
    (document) =>
      document.status === "PENDING" || document.status === "PROCESSING",
  );

  const mergeDocuments = (fresh: Document[]) => {
    setDocuments((current) => {
      const currentById = new Map(current.map((doc) => [doc.id, doc]));

      for (const doc of fresh) {
        const previous = currentById.get(doc.id);
        if (previous && previous.status !== doc.status) {
          if (doc.status === "READY") {
            toast.success(`${doc.fileName} is ready`);
          } else if (doc.status === "FAILED") {
            toast.error(doc.error ?? `${doc.fileName} failed to process.`);
          }
        }
      }

      return fresh.map((doc) => {
        const previous = currentById.get(doc.id);
        return previous ? { ...previous, ...doc } : doc;
      });
    });
  };

  useEffect(() => {
    if (!hasPendingDocuments) {
      return;
    }

    let cancelled = false;

    const poll = async () => {
      if (document.visibilityState === "hidden") {
        return;
      }

      try {
        const response = await fetch(
          `/api/projects/${project.id}/documents`,
        );
        const payload = await response.json();

        if (cancelled || !response.ok || !payload.success) {
          return;
        }

        mergeDocuments(payload.data.documents as Document[]);
      } catch {
        // Network hiccup — retry on the next tick.
      }
    };

    const intervalId = setInterval(poll, DOCUMENT_POLL_INTERVAL_MS);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void poll();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPendingDocuments, project.id]);

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
    setSelectedDocumentIds(
      chats.find((chat) => chat.id === chatId)?.documentIds ?? [],
    );
    void loadMessages(chatId);
  };

  const createChat = async (): Promise<Chat> => {
    const response = await fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: project.id,
        documentIds: selectedDocumentIds,
      }),
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
        body: JSON.stringify({
          content: trimmed,
          documentIds: selectedDocumentIds,
        }),
      });

      let payload:
        | (SendMessageResponse & { data: { scopedDocumentIds?: string[] } })
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

      if (payload.data.scopedDocumentIds) {
        const resolvedScope = payload.data.scopedDocumentIds;
        setSelectedDocumentIds(resolvedScope);
        setChats((current) =>
          current.map((c) =>
            c.id === chatId ? { ...c, documentIds: resolvedScope } : c,
          ),
        );
      }

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

  const renameChat = async (chatId: string, title: string) => {
    const previousChats = chats;
    setChats((current) =>
      current.map((chat) => (chat.id === chatId ? { ...chat, title } : chat)),
    );

    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload?.error?.message ?? "Failed to rename chat.");
      }

      setChats((current) =>
        current.map((chat) => (chat.id === chatId ? payload.data.chat : chat)),
      );
    } catch (error) {
      setChats(previousChats);
      toast.error(
        error instanceof Error ? error.message : "Failed to rename chat.",
      );
    }
  };

  const deleteChat = async (chatId: string) => {
    const previousChats = chats;
    const previousMessagesByChatId = messagesByChatId;
    const previousActiveChatId = activeChatId;

    const remainingChats = previousChats.filter((chat) => chat.id !== chatId);
    setChats(remainingChats);
    setMessagesByChatId((current) => {
      const next = { ...current };
      delete next[chatId];
      return next;
    });
    if (previousActiveChatId === chatId) {
      setActiveChatId(null);
    }

    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload?.error?.message ?? "Failed to delete chat.");
      }
    } catch (error) {
      setChats(previousChats);
      setMessagesByChatId(previousMessagesByChatId);
      setActiveChatId(previousActiveChatId);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete chat.",
      );
    }
  };

  const schedulePersistSelection = (ids: string[]) => {
    if (!activeChatId) {
      return;
    }

    if (scopePatchTimeoutRef.current) {
      clearTimeout(scopePatchTimeoutRef.current);
    }

    const chatId = activeChatId;
    scopePatchTimeoutRef.current = setTimeout(() => {
      fetch(`/api/chats/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentIds: ids }),
      })
        .then((response) => response.json())
        .then((payload) => {
          if (payload?.success) {
            setChats((current) =>
              current.map((c) => (c.id === chatId ? payload.data.chat : c)),
            );
          }
        })
        .catch(() => {
          // Selection stays correct locally; it'll persist on the next change.
        });
    }, SCOPE_PATCH_DEBOUNCE_MS);
  };

  const toggleSelectDocument = (documentId: string) => {
    setSelectedDocumentIds((current) => {
      const next = current.includes(documentId)
        ? current.filter((id) => id !== documentId)
        : [...current, documentId];
      schedulePersistSelection(next);
      return next;
    });
  };

  const selectAllDocuments = () => {
    const readyIds = documents
      .filter((document) => document.status === "READY")
      .map((document) => document.id);
    setSelectedDocumentIds(readyIds);
    schedulePersistSelection(readyIds);
  };

  const clearSelection = () => {
    setSelectedDocumentIds([]);
    schedulePersistSelection([]);
  };

  const addFileSource = async (file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append("mode", "file");
    formData.append("file", file);

    const response = await fetch(`/api/projects/${project.id}/documents`, {
      method: "POST",
      body: formData,
    });

    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload?.error?.message ?? "Failed to add source.");
    }

    const document = payload.data.document as Document;
    setDocuments((current) => [document, ...current]);
    toast.success("Added — processing…");
    return document;
  };

  const addTextSource = async ({
    title,
    text,
  }: {
    title: string;
    text: string;
  }): Promise<Document> => {
    const formData = new FormData();
    formData.append("mode", "text");
    formData.append("text", text);
    if (title) {
      formData.append("title", title);
    }

    const response = await fetch(`/api/projects/${project.id}/documents`, {
      method: "POST",
      body: formData,
    });

    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload?.error?.message ?? "Failed to add source.");
    }

    const document = payload.data.document as Document;
    setDocuments((current) => [document, ...current]);
    toast.success("Added — processing…");
    return document;
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
    setSelectedDocumentIds((current) => {
      if (!current.includes(documentId)) {
        return current;
      }
      const next = current.filter((id) => id !== documentId);
      schedulePersistSelection(next);
      return next;
    });
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
            documents={documents}
            selectedDocumentIds={selectedDocumentIds}
            onClearScope={clearSelection}
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
                selectedDocumentIds={selectedDocumentIds}
                onToggleSelect={toggleSelectDocument}
                onSelectAll={selectAllDocuments}
                onClearSelection={clearSelection}
                onAddFileSource={addFileSource}
                onAddTextSource={addTextSource}
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
              selectedDocumentIds={selectedDocumentIds}
              onToggleSelect={toggleSelectDocument}
              onSelectAll={selectAllDocuments}
              onClearSelection={clearSelection}
              onAddFileSource={addFileSource}
              onAddTextSource={addTextSource}
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
