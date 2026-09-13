import { useEffect, useRef, useState } from "react";

export interface UseResizablePanelOptions {
  storageKey: string;
  /** Which edge the handle sits on. "right" = panel grows as pointer moves right. */
  edge: "left" | "right";
  defaultWidth: number;
  minWidth: number;
  /** Hard ceiling in px. The effective max is also clamped by getMaxWidth. */
  maxWidth: number;
  collapsedWidth: number;
  /** Optional dynamic ceiling, recomputed on window resize. */
  getMaxWidth?: () => number;
  collapsible?: boolean;
  ariaLabel?: string;
}

const ARROW_KEY_STEP = 16;
const ARROW_KEY_STEP_LARGE = 40;

export function useResizablePanel<T extends HTMLElement = HTMLDivElement>({
  storageKey,
  edge,
  defaultWidth,
  minWidth,
  maxWidth,
  collapsedWidth,
  getMaxWidth,
  collapsible = true,
  ariaLabel = "Resize panel",
}: UseResizablePanelOptions) {
  const elementRef = useRef<T>(null);
  const dragState = useRef<{ pointerId: number; startX: number; startWidth: number } | null>(
    null,
  );

  const [width, setWidth] = useState(defaultWidth);
  const [collapsed, setCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [effectiveMaxWidth, setEffectiveMaxWidth] = useState(maxWidth);

  const clampWidth = (value: number) => {
    const ceiling = Math.max(minWidth, Math.min(maxWidth, effectiveMaxWidth));
    return Math.min(Math.max(value, minWidth), ceiling);
  };

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored === "collapsed") {
        if (collapsible) {
          setCollapsed(true);
        }
      } else if (stored) {
        const parsed = Number(stored);
        if (!Number.isNaN(parsed)) {
          setWidth(Math.min(Math.max(parsed, minWidth), maxWidth));
        }
      }
    } catch {
      // localStorage unavailable — fall back to the default width.
    }
    // Only ever read from storage once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recomputes the dynamic ceiling and re-clamps the current width against
  // it (functional updater so this composes with the storage-read effect
  // above, whichever order they fire in during the mount commit).
  useEffect(() => {
    if (!getMaxWidth) {
      return;
    }

    const update = () => {
      const ceiling = getMaxWidth();
      setEffectiveMaxWidth(ceiling);
      setWidth((current) => {
        const clampCeiling = Math.max(minWidth, Math.min(maxWidth, ceiling));
        return Math.min(Math.max(current, minWidth), clampCeiling);
      });
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [getMaxWidth, minWidth, maxWidth]);

  const persist = (next: { width: number } | { collapsed: true }) => {
    try {
      window.localStorage.setItem(
        storageKey,
        "collapsed" in next ? "collapsed" : String(Math.round(next.width)),
      );
    } catch {
      // Ignore write failures (private browsing, storage full, etc.).
    }
  };

  const applyWidth = (px: number) => {
    if (elementRef.current) {
      elementRef.current.style.width = `${px}px`;
    }
  };

  const commitWidth = (px: number) => {
    const clamped = clampWidth(px);
    setCollapsed(false);
    setWidth(clamped);
    applyWidth(clamped);
    persist({ width: clamped });
  };

  const commitCollapsed = () => {
    setCollapsed(true);
    applyWidth(collapsedWidth);
    persist({ collapsed: true });
  };

  const collapse = () => {
    setCollapsed(true);
    persist({ collapsed: true });
  };

  const expand = () => {
    setCollapsed(false);
    persist({ width });
  };

  const collapseSnapThreshold = minWidth - 40;

  const resolveProposedWidth = (clientX: number, state: { startX: number; startWidth: number }) => {
    const delta = clientX - state.startX;
    return edge === "left" ? state.startWidth - delta : state.startWidth + delta;
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: collapsed ? minWidth : width,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!dragState.current || dragState.current.pointerId !== event.pointerId) {
      return;
    }

    const proposedWidth = resolveProposedWidth(event.clientX, dragState.current);

    applyWidth(
      collapsible && proposedWidth < collapseSnapThreshold
        ? collapsedWidth
        : clampWidth(proposedWidth),
    );
  };

  const endDrag = (event: React.PointerEvent) => {
    if (!dragState.current || dragState.current.pointerId !== event.pointerId) {
      return;
    }

    const proposedWidth = resolveProposedWidth(event.clientX, dragState.current);
    dragState.current = null;
    setIsDragging(false);

    if (collapsible && proposedWidth < collapseSnapThreshold) {
      commitCollapsed();
    } else {
      commitWidth(proposedWidth);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? ARROW_KEY_STEP_LARGE : ARROW_KEY_STEP;
    const current = collapsed ? minWidth : width;
    const growKey = edge === "left" ? "ArrowLeft" : "ArrowRight";
    const shrinkKey = edge === "left" ? "ArrowRight" : "ArrowLeft";

    if (event.key === shrinkKey) {
      event.preventDefault();
      const next = current - step;
      if (collapsible && next < collapseSnapThreshold) {
        commitCollapsed();
      } else {
        commitWidth(next);
      }
    } else if (event.key === growKey) {
      event.preventDefault();
      commitWidth(current + step);
    }
  };

  const handleDoubleClick = () => {
    commitWidth(defaultWidth);
  };

  const effectiveWidth = collapsed ? collapsedWidth : width;

  const handleProps = {
    role: "separator" as const,
    "aria-orientation": "vertical" as const,
    "aria-label": ariaLabel,
    "aria-valuenow": Math.round(effectiveWidth),
    "aria-valuemin": collapsedWidth,
    "aria-valuemax": Math.round(Math.max(minWidth, Math.min(maxWidth, effectiveMaxWidth))),
    tabIndex: 0,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    onKeyDown: handleKeyDown,
    onDoubleClick: handleDoubleClick,
  };

  return {
    width,
    effectiveWidth,
    collapsed,
    isDragging,
    elementRef,
    collapse,
    expand,
    handleProps,
  };
}
