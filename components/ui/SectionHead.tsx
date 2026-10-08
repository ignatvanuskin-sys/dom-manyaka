import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import Reveal from "@/components/ui/Reveal";

type Props = {
  index: string;
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
  align?: "left" | "center";
};

export default function SectionHead({
  index,
  eyebrow,
  title,
  lead,
  className,
  align = "left",
}: Props) {
  return (
    <header className={cn("relative", className)}>
      <Reveal className="flex items-center gap-4">
        <span className="stamp text-blood ember-pulse">{index}</span>
        <span aria-hidden className="h-px w-10 bg-blood/50" />
        <span className="eyebrow text-dust">{eyebrow}</span>
      </Reveal>

      <Reveal delay={0.06} variant="glitch" className="mt-5">
        <h2
          className={cn(
            "display text-[11.5vw] leading-[0.88] text-bone sm:text-[8vw] lg:text-[4.6rem] xl:text-[5.4rem]",
            align === "center" && "mx-auto max-w-[22ch] text-center",
          )}
        >
          {title}
        </h2>
      </Reveal>

      {lead && (
        <Reveal delay={0.12} className="mt-6">
          <div
            className={cn(
              "max-w-[62ch] text-[0.98rem] leading-relaxed text-bone/70 sm:text-base",
              align === "center" && "mx-auto text-center",
            )}
          >
            {lead}
          </div>
        </Reveal>
      )}
    </header>
  );
}
