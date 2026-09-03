"use client";

import { useState } from "react";

import { Ellipsis, MessageSquare, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Chat } from "@/types";

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateChat: () => Promise<void> | void;
  onRenameChat?: (chatId: string) => Promise<void> | void;
  onDeleteChat?: (chatId: string) => Promise<void> | void;
}

export function ChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
  onCreateChat,
  onRenameChat,
  onDeleteChat,
}: ChatSidebarProps) {
  const [isCreating, setIsCreating] = useState(false);

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

  return (
    <aside
      className="flex h-full flex-col rounded-3xl border bg-card/90"
      style={{ minHeight: 420 }}
    >
      <div className="flex items-center justify-between border-b px-4 py-4">
        <div>
          <p className="text-sm text-muted-foreground">Chats</p>
          <h3 className="text-lg font-semibold">Conversation list</h3>
        </div>
        <Button size="sm" onClick={handleCreateChat} disabled={isCreating}>
          <Plus className="size-4" />
          {isCreating ? "Creating" : "New chat"}
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-3">
          {chats.map((chat) => {
            const active = chat.id === activeChatId;

            return (
              <button
                key={chat.id}
                type="button"
                onClick={() => onSelectChat(chat.id)}
                className={cn(
                  "flex w-full items-start justify-between gap-3 rounded-2xl border px-3 py-3 text-left transition-colors",
                  active
                    ? "border-primary/20 bg-primary/10"
                    : "bg-background hover:bg-muted",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare
                      className={cn(
                        "size-4",
                        active ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <p className="truncate text-sm font-medium">{chat.title}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Updated {new Date(chat.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Ellipsis className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      disabled={!onRenameChat}
                      onClick={() => onRenameChat?.(chat.id)}
                    >
                      <Pencil className="mr-2 size-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      disabled={!onDeleteChat}
                      onClick={() => onDeleteChat?.(chat.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}
// Create the chat history sidebar.
//
// Include:
// - "New Chat" button.
// - List of chats.
// - Active chat indicator.
// - Optional chat actions menu.
//
// Each chat item should display:
// - Title.
// - Last updated information if available.
//
// Behavior:
// - Clicking a chat changes the active chat.
// - New Chat creates a new mock chat in local state.
// - The newly created chat becomes active.
//
// Use:
// - shadcn Button.
// - shadcn ScrollArea.
// - shadcn DropdownMenu.
// - shadcn Tooltip if useful.
//
// Design:
// - Compact and easy to scan.
// - Pink accent for the active chat.
