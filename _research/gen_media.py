# -*- coding: utf-8 -*-
"""Собирает lib/media.ts из manifest.json + подписи авторов из 2ГИС."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
man = json.load(open(os.path.join(HERE, 'manifest.json'), encoding='utf-8'))

# ключ -> (источник 2ГИС, alt, автор, дата, альбом)
META = {
    'hero-desktop': ('13', 'Актёр в маске и чёрном плаще стоит посреди комнаты с красными стенами',
                     'ena_nur erme', '30 июля 2026', 'От пользователя'),
    'hero-mobile': ('13', 'Актёр в маске и чёрном плаще в красной комнате',
                    'ena_nur erme', '30 июля 2026', 'От пользователя'),
    'blood-drips': ('02', 'Красные потёки на белой стене у чёрного проёма',
                    'aisuzy', '18 апреля 2025', 'От пользователей'),
    'blood-detail': ('02', 'Крупный план: красные потёки по белой стене',
                     'aisuzy', '18 апреля 2025', 'От пользователей'),
    'stairs': ('04', 'Лестница в тёмный тамбур, стальная дверь и слабый свет изнутри',
               'aisuzy', '18 апреля 2025', 'От пользователей'),
    'red-room': ('01', 'Красные стены и потолок комнаты, диван у дальней стены',
                 'Jenis Sailau', '11 мая 2025', 'От пользователя'),
    'cctv-wall': ('10', 'Мониторы с камерами наблюдения и ночная улица на экранах',
                  'yellowsun ;)', '27 февраля 2025', 'Из отзывов'),
    'cctv-feed': ('14', 'Стена мониторов с камерами наблюдения в тёмной комнате',
                  'yellowsun ;)', '27 февраля 2025', 'Из отзывов'),
    'sign-black': ('16', 'Вывеска DOM MANYAKA: красный череп и потёки на чёрном фоне',
                   'Aknar Murai', '27 февраля 2025', 'От пользователя'),
    'screen-glow': ('06', 'Экран с черепом и надписью DOM MANYAKA в полной темноте',
                    'Kydyr Konisbaev', '5 октября 2026', 'Из отзывов'),
    'entrance': ('17', 'Дом на улице Манаса, 57 — вход в локацию со стороны улицы',
                 'Жан', '15 мая 2022', 'От пользователя'),
    'door': ('12', 'Табличка DOM MANYAKA на стене у входа',
             'zhans', '29 мая 2025', 'Вход'),
}

lines = [
    '/** Файл сгенерирован из _research/gen_media.py — правьте там, а не здесь. */',
    '',
    'export type Media = {',
    '  src: string;',
    '  width: number;',
    '  height: number;',
    '  blurDataURL: string;',
    '  alt: string;',
    '  credit: string;',
    '};',
    '',
    'export const media = {',
]
for key, (src, alt, author, date, album) in META.items():
    m = man[key]
    credit = f"Фото: {author} · {album} · 2ГИС, {date}"
    lines.append(f'  "{key}": {{')
    lines.append(f'    src: "{m["src"]}",')
    lines.append(f'    width: {m["width"]},')
    lines.append(f'    height: {m["height"]},')
    lines.append(f'    blurDataURL:')
    lines.append(f'      "{m["blurDataURL"]}",')
    lines.append(f'    alt: {json.dumps(alt, ensure_ascii=False)},')
    lines.append(f'    credit: {json.dumps(credit, ensure_ascii=False)},')
    lines.append('  },')
lines.append('} as const satisfies Record<string, Media>;')
lines.append('')
lines.append('export type MediaKey = keyof typeof media;')
lines.append('')

out = os.path.abspath(os.path.join(HERE, '..', 'lib', 'media.ts'))
open(out, 'w', encoding='utf-8').write('\n'.join(lines))
print('ok ->', out, len('\n'.join(lines)), 'chars')
