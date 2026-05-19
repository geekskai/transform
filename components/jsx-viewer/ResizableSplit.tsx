import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ResizableSplitProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultLeftPercent?: number;
  minLeftPercent?: number;
  maxLeftPercent?: number;
  className?: string;
}

export default function ResizableSplit({
  left,
  right,
  defaultLeftPercent = 50,
  minLeftPercent = 28,
  maxLeftPercent = 72,
  className = ""
}: ResizableSplitProps) {
  const [leftPercent, setLeftPercent] = useState(defaultLeftPercent);
  const draggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      if (!draggingRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const next = ((event.clientX - rect.left) / rect.width) * 100;
      setLeftPercent(Math.min(maxLeftPercent, Math.max(minLeftPercent, next)));
    },
    [maxLeftPercent, minLeftPercent]
  );

  const stopDragging = useCallback(() => {
    draggingRef.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    const move = (event: PointerEvent) => onPointerMove(event);
    const up = () => stopDragging();

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [onPointerMove, stopDragging]);

  return (
    <div
      ref={containerRef}
      className={`flex min-h-[720px] overflow-hidden ${className}`}
    >
      <div
        className="flex min-w-0 flex-col overflow-hidden border-r"
        style={{ width: `${leftPercent}%` }}
      >
        {left}
      </div>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize editor and preview"
        className="group relative z-10 w-1.5 flex-shrink-0 cursor-col-resize bg-slate-100 transition-colors hover:bg-purple-200"
        onPointerDown={event => {
          draggingRef.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          document.body.style.cursor = "col-resize";
          document.body.style.userSelect = "none";
        }}
      >
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-slate-300 group-hover:bg-purple-400" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {right}
      </div>
    </div>
  );
}
