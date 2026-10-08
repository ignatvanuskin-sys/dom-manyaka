import Atmosphere from "@/components/Atmosphere";
import Awaits from "@/components/Awaits";
import Booking from "@/components/Booking";
import Cursor from "@/components/Cursor";
import FactTicker from "@/components/FactTicker";
import Faq from "@/components/Faq";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Interlude from "@/components/Interlude";
import Location from "@/components/Location";
import Preloader from "@/components/Preloader";
import Prices from "@/components/Prices";
import Quest from "@/components/Quest";
import Reviews from "@/components/Reviews";
import ScrollProgress from "@/components/ScrollProgress";
import StickyCta from "@/components/StickyCta";
import Story from "@/components/Story";
import WarningBand from "@/components/WarningBand";
import { company, faq, prices, rating, SITE_URL } from "@/lib/content";

const business = {
  "@context": "https://schema.org",
  "@type": "EntertainmentBusiness",
  "@id": `${SITE_URL}/#business`,
  name: "Дом Маньяка",
  alternateName: "Dom Manyaka",
  description:
    "Атмосферный хоррор-квест в Алматы: 60 минут, 2–20 игроков, актёры внутри. Ул. Манаса, 57, Бостандыкский район.",
  url: SITE_URL,
  image: `${SITE_URL}/og.jpg`,
  telephone: "+77018229284",
  priceRange: `от ${prices.rows[0].total.toLocaleString("ru-RU")} ₸ за команду`,
  currenciesAccepted: "KZT",
  paymentAccepted: company.payments.join(", "),
  address: {
    "@type": "PostalAddress",
    streetAddress: "ул. Манаса, 57",
    addressLocality: "Алматы",
    addressRegion: "Бостандыкский район",
    addressCountry: "KZ",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: company.geo.lat,
    longitude: company.geo.lon,
  },
  hasMap: company.route,
  sameAs: [company.instagram, company.twogis],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: rating.value,
    bestRating: rating.outOf,
    ratingCount: rating.ratings,
    reviewCount: rating.reviews,
  },
  review: [
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Нурдаулет Даулетов" },
      datePublished: "2025-03-30",
      reviewBody:
        "Очень классный квест, самый лучший где я был. Аниматорам, организаторам огромное спасибо. Советую, не пожалеете",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Shakhnaz Komunarova" },
      datePublished: "2026-08-14",
      reviewBody:
        "Было очень классно! Меня швыряли по комнате! И всех тащили за ноги, было очень весело",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Babikhan Zhantemir" },
      datePublished: "2026-09-10",
      reviewBody:
        "Не советую данное место. Админ с этим напарником матерятся, на ровном месте придумывают правила и штрафы. И это ещё Лайт режим. Больше не приду.",
      reviewRating: { "@type": "Rating", ratingValue: "1", bestRating: "5" },
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function Home() {
  return (
    <>
      <Preloader />
      <ScrollProgress />
      <Header />
      <Atmosphere />

      <main>
        <Hero />
        <FactTicker />
        <Story />
        <Awaits />
        <Quest />
        <Gallery />
        <Interlude />
        <Reviews />
        <Prices />
        <Booking />
        <Faq />
        <WarningBand />
        <Location />
        <FinalCta />
      </main>

      <Footer />
      <StickyCta />
      <Cursor />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
