import type { MetadataRoute } from "next";
import { company } from "@/lib/content";

/** Даёт нормальный запуск с домашнего экрана телефона: тёмный фон, без адресной строки. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Дом Маньяка — хоррор-квест в Алматы",
    short_name: "Дом Маньяка",
    description:
      "Атмосферный хоррор-квест на Манаса, 57. 60 минут, 2–20 игроков, актёры внутри.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#040305",
    theme_color: "#040305",
    lang: "ru",
    dir: "ltr",
    categories: ["entertainment", "games"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Забронировать игру", short_name: "Бронь", url: "/#booking" },
      { name: "Цены", short_name: "Цены", url: "/#price" },
      { name: "Позвонить", short_name: "Звонок", url: company.phoneHref },
    ],
  };
}
