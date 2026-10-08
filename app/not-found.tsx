import type { Metadata } from "next";
import { company } from "@/lib/content";
import Cta from "@/components/ui/Cta";
import Atmosphere from "@/components/Atmosphere";

export const metadata: Metadata = {
  title: "Страница не найдена",
  description: "Такой страницы на сайте «Дом Маньяка» нет. Вернитесь на главную или позвоните нам.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Atmosphere />
      <main className="relative flex min-h-[100svh] flex-col justify-center bg-void px-5 py-24 md:px-8">
        <div className="relative mx-auto w-full max-w-[1680px]">
          <p className="stamp text-blood">ошибка 404</p>

          <h1 className="display mt-6 text-[24vw] leading-[0.82] text-bone sm:text-[16vw] lg:text-[10rem]">
            404
          </h1>

          <p className="editorial mt-6 max-w-[34ch] text-2xl leading-snug text-bone/80 sm:text-3xl">
            Этой двери здесь нет. Возможно, её никогда и не было.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Cta href="/" size="lg" magnetic cursorLabel="Вернуться">
              На главную
            </Cta>
            <Cta href={company.whatsapp} external variant="ghost" size="lg">
              Написать в WhatsApp
            </Cta>
            <Cta href={company.phoneHref} variant="line" size="md" className="sm:ml-2">
              {company.phoneDisplay}
            </Cta>
          </div>

          <nav aria-label="Основные разделы" className="mt-14 border-t border-bone/12 pt-6">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {[
                { label: "Квест", href: "/#quest" },
                { label: "Цены", href: "/#price" },
                { label: "Отзывы", href: "/#reviews" },
                { label: "Вопросы", href: "/#faq" },
                { label: "Контакты", href: "/#contacts" },
              ].map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="eyebrow flex min-h-11 items-center text-[0.6rem] text-dust transition-colors hover:text-bone"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
    </>
  );
}
