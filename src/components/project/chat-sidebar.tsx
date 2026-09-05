"use client";

import { useRef, useState } from "react";

import {
  Ellipsis,
  MessageSquare,
  MessagesSquare,
  PanelLeftClose,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MAX_CHAT_TITLE_LENGTH } from "@/lib/validations";
import { cn } from "@/lib/utils";
import type { Chat } from "@/types";

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateChat: () => Promise<unknown> | void;
  onRenameChat?: (chatId: string, title: string) => Promise<void> | void;
  onDeleteChat?: (chatId: string) => Promise<void> | void;
  onCollapse?: () => void;
}

export function ChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
  onCreateChat,
  onRenameChat,
  onDeleteChat,
  onCollapse,
}: ChatSidebarProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameSettledRef = useRef(false);
  const [deleteTarget, setDeleteTarget] = useState<Chat | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateChat = async () => {
    if (isCreating) {
      return;
    }

    setIsCreating(true);

    try {
      await onCreateChat();
    } finally {
      setIsCreating(false);
    }
  };

  const startRename = (chat: Chat) => {
    renameSettledRef.current = false;
    setRenamingChatId(chat.id);
    setRenameValue(chat.title);
  };

  const cancelRename = () => {
    renameSettledRef.current = true;
    setRenamingChatId(null);
  };

  const commitRename = (chat: Chat) => {
    if (renameSettledRef.current) {
      return;
    }
    renameSettledRef.current = true;
    setRenamingChatId(null);

    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === chat.title) {
      return;
    }

    void onRenameChat?.(chat.id, trimmed);
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDeleteChat?.(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-lg border bg-card/90">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
        <MessagesSquare className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Chats</h3>
        <div className="ml-auto flex items-center gap-1">
          <Button
            size="icon-sm"
            onClick={handleCreateChat}
            disabled={isCreating}
            aria-label="New chat"
          >
            <Plus className="size-4" />
          </Button>
          {onCollapse ? (
            <Button
              variant="ghost"
              size="icon-sm"
              className="hidden lg:flex"
              aria-label="Collapse chats panel"
              onClick={onCollapse}
            >
              <PanelLeftClose className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-1 p-2">
          {chats.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              No chats yet. Start one to ask about your documents.
            </div>
          ) : null}
          {chats.map((chat) => {
            const active = chat.id === activeChatId;
            const isRenaming = renamingChatId === chat.id;

            return (
              <div
                key={chat.id}
                className={cn(
                  "group relative flex w-full items-start justify-between gap-2 rounded-md px-2.5 py-2 transition-colors",
                  active ? "bg-primary/10" : "hover:bg-muted/50",
                )}
              >
                {!isRenaming ? (
                  <button
                    type="button"
                    onClick={() => onSelectChat(chat.id)}
                    aria-label={`Open chat ${chat.title}`}
                    aria-current={active ? "true" : undefined}
                    className="absolute inset-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                ) : null}

                <div className="relative z-10 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare
                      className={cn(
                        "size-3.5 shrink-0",
                        active ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    {isRenaming ? (
                      <Input
                        autoFocus
                        value={renameValue}
                        maxLength={MAX_CHAT_TITLE_LENGTH}
                        aria-label="Chat title"
                        onFocus={(event) => event.currentTarget.select()}
                        onChange={(event) =>
                          setRenameValue(event.target.value)
                        }
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            commitRename(chat);
                          } else if (event.key === "Escape") {
                            event.preventDefault();
                            cancelRename();
                          }
                        }}
                        onBlur={() => commitRename(chat)}
                        className="h-6"
                      />
                    ) : (
                      <p className="truncate text-sm font-medium">
                        {chat.title}
                      </p>
                    )}
                  </div>
                  {!isRenaming ? (
                    <p className="mt-0.5 pl-5.5 text-xs text-muted-foreground">
                      {new Date(chat.updatedAt).toLocaleDateString()}
                    </p>
                  ) : null}
                </div>

                {!isRenaming ? (
                  <div className="relative z-10 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Chat actions"
                          className="data-[state=open]:opacity-100"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Ellipsis className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          disabled={!onRenameChat}
                          onClick={() => startRename(chat)}
                        >
                          <Pencil className="mr-2 size-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={!onDeleteChat}
                          onClick={() => setDeleteTarget(chat)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `“${deleteTarget.title}” and all of its messages will be permanently removed. This cannot be undone.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}
