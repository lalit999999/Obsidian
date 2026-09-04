"use client";

import { useState } from "react";

import {
  Ellipsis,
  MessageSquare,
  MessagesSquare,
  PanelLeftClose,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

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
  onCreateChat: () => Promise<unknown> | void;
  onRenameChat?: (chatId: string) => Promise<void> | void;
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

            return (
              <div
                key={chat.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectChat(chat.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectChat(chat.id);
                  }
                }}
                className={cn(
                  "flex w-full cursor-pointer items-start justify-between gap-2 rounded-md px-2.5 py-2 text-left transition-colors",
                  active
                    ? "bg-primary/10"
                    : "hover:bg-muted/50",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare
                      className={cn(
                        "size-3.5 shrink-0",
                        active ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <p className="truncate text-sm font-medium">{chat.title}</p>
                  </div>
                  <p className="mt-0.5 pl-5.5 text-xs text-muted-foreground">
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Chat actions"
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
                      variant="destructive"
                      disabled={!onDeleteChat}
                      onClick={() => onDeleteChat?.(chat.id)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}
