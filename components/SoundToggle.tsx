"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Graph = { master: GainNode; stop: () => void };

/**
 * Звук никогда не включается сам. Гул синтезируется в браузере (Web Audio),
 * поэтому сайт не тянет ни одного аудиофайла.
 */
export default function SoundToggle({ className }: { className?: string }) {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const graphRef = useRef<Graph | null>(null);

  const shutdown = useCallback(() => {
    const g = graphRef.current;
    if (!g) return;
    graphRef.current = null;
    const ctx = ctxRef.current;
    try {
      g.master.gain.cancelScheduledValues(ctx?.currentTime ?? 0);
      g.master.gain.setValueAtTime(g.master.gain.value, ctx?.currentTime ?? 0);
      g.master.gain.linearRampToValueAtTime(0.0001, (ctx?.currentTime ?? 0) + 0.9);
      window.setTimeout(g.stop, 1100);
    } catch {
      g.stop();
    }
  }, []);

  const boot = useCallback((): Graph | null => {
    const Ctor =
      typeof window !== "undefined"
        ? window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext
        : undefined;
    if (!Ctor) return null;

    const ctx = ctxRef.current ?? new Ctor();
    ctxRef.current = ctx;
    void ctx.resume();

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.connect(ctx.destination);

    const breath = ctx.createGain();
    breath.gain.value = 0.75;
    breath.connect(master);

    // низкий гул — два расстроенных синуса
    const o1 = ctx.createOscillator();
    o1.type = "sine";
    o1.frequency.value = 41;
    const o2 = ctx.createOscillator();
    o2.type = "sine";
    o2.frequency.value = 61.4;
    const oGain = ctx.createGain();
    oGain.gain.value = 0.2;
    o1.connect(oGain);
    o2.connect(oGain);
    oGain.connect(breath);

    // шумовой слой — коричневый шум через лоупасс
    const len = Math.floor(ctx.sampleRate * 4);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 340;
    lp.Q.value = 0.8;
    const nGain = ctx.createGain();
    nGain.gain.value = 0.45;
    noise.connect(lp);
    lp.connect(nGain);
    nGain.connect(breath);

    // «дыхание» помещения
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.05;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.17;
    lfo.connect(lfoGain);
    lfoGain.connect(breath.gain);

    [o1, o2, noise, lfo].forEach((n) => n.start());
    master.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2.6);

    return {
      master,
      stop: () => {
        [o1, o2, noise, lfo].forEach((n) => {
          try {
            n.stop();
          } catch {
            /* уже остановлен */
          }
        });
      },
    };
  }, []);

  const toggle = useCallback(() => {
    if (on) {
      shutdown();
      setOn(false);
      return;
    }
    const g = boot();
    if (!g) return;
    graphRef.current = g;
    setOn(true);
  }, [boot, on, shutdown]);

  useEffect(
    () => () => {
      const g = graphRef.current;
      graphRef.current = null;
      g?.stop();
      void ctxRef.current?.close().catch(() => undefined);
    },
    [],
  );

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      data-cursor={on ? "Тишина" : "Звук"}
      className={cn(
        "group flex items-center gap-2.5 text-dust transition-colors duration-300 hover:text-bone",
        className,
      )}
    >
      <span className="relative flex size-8 items-center justify-center border border-dust/30 transition-colors group-hover:border-bone/50">
        {on ? <Volume2 className="size-3.5" aria-hidden /> : <VolumeX className="size-3.5" aria-hidden />}
        {on && (
          <span
            aria-hidden
            className="ember-pulse absolute -right-px -top-px size-1.5 bg-blood"
          />
        )}
      </span>
      <span className="stamp !text-[0.55rem] transition-colors">
        {on ? "звук вкл" : "звук выкл"}
      </span>
    </button>
  );
}
