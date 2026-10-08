"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Запасной путь для компьютеров без WhatsApp: текст заявки можно скопировать
 * и отправить любым удобным способом — SMS, Telegram, почтой.
 */
export default function CopyRequest({ text, className }: { text: string; className?: string }) {
  const [state, setState] = useState<"idle" | "done" | "fail">("idle");
  const timer = useRef<number>(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
    } catch {
      // Старые браузеры и http-контексты: выделяем текст и просим скопировать.
      setState("fail");
    }
    timer.current = window.setTimeout(() => setState("idle"), 2600);
  }, [text]);

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex min-h-11 items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-dust transition-colors hover:text-bone ${className ?? ""}`}
    >
      {state === "done" ? (
        <>
          <Check className="size-3.5 text-ember" aria-hidden />
          Текст скопирован
        </>
      ) : state === "fail" ? (
        <>
          <Copy className="size-3.5" aria-hidden />
          Скопируйте вручную
        </>
      ) : (
        <>
          <Copy className="size-3.5" aria-hidden />
          Скопировать текст заявки
        </>
      )}
    </button>
  );
}
