import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://annadan.harekrishnavizag.org";
const DEFAULT_IMAGE = "https://storage.googleapis.com/subhojanam/hero.webp";
const DEFAULT_TITLE =
  "Annadana Seva | Donate Meals for Needy People in Visakhapatnam";
const DEFAULT_DESCRIPTION =
  "Support Annadana Seva by donating meals for needy people at government hospitals in Visakhapatnam. Your contribution helps serve fresh prasadam meals through Hare Krishna Movement.";
const DEFAULT_KEYWORDS =
  "Annadana Seva, Annadanam, food donation, hospital feeding program, prasadam donation, needy people donation, ISKCON Visakhapatnam, Hare Krishna Movement, charity donation, meal donation, 80G donation";

const FAQ_ENTRIES = [
  {
    question: "Is my donation eligible for 80G tax exemption?",
    answer:
      "Yes. ISKCON Visakhapatnam is a registered charitable trust under Section 80G of the Income Tax Act. Donors receive a tax exemption certificate after eligible donations.",
  },
  {
    question: "How exactly are meals distributed?",
    answer:
      "Fresh prasadam meals are prepared in FSSAI-certified temple kitchens and distributed daily at government hospitals in Visakhapatnam for needy people and patient attendants.",
  },
  {
    question: "Can I set up a monthly recurring donation?",
    answer:
      "Yes. Supporters can choose a monthly donation option to help the program serve meals consistently every month.",
  },
  {
    question: "Who are the beneficiaries of this program?",
    answer:
      "The program supports needy people, family members, and attendants staying with patients at government hospitals, especially people who travel from rural areas and struggle to afford meals.",
  },
];

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function upsertLink(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function upsertJsonLd(id, data) {
  let element = document.getElementById(id);

  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.id = id;
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(data);
}

function removeJsonLd(id) {
  const element = document.getElementById(id);
  if (element) {
    element.remove();
  }
}

function getPageSeo(pathname) {
  if (pathname === "/") {
    return {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      keywords: DEFAULT_KEYWORDS,
      robots: "index, follow",
      canonical: `${SITE_URL}/`,
      structuredData: [
        {
          "@context": "https://schema.org",
          "@type": "NGO",
          name: "Annadana Seva",
          alternateName: "Hare Krishna Movement Visakhapatnam - Annadana",
          url: `${SITE_URL}/`,
          logo: `${SITE_URL}/favicon.ico`,
          image: DEFAULT_IMAGE,
          description: DEFAULT_DESCRIPTION,
          email: "mukunda@hkmvizag.org",
          telephone: "+91-8977761187",
          address: {
            "@type": "PostalAddress",
            streetAddress: "KGH Down Rd, beside orthopedic ward, Maharani Peta",
            addressLocality: "Visakhapatnam",
            addressRegion: "Andhra Pradesh",
            postalCode: "530002",
            addressCountry: "IN",
          },
          sameAs: [
            "https://www.facebook.com/hkm.vizag",
            "https://www.instagram.com/harekrishnavizag",
            "https://www.youtube.com/user/harekrishnavizag",
          ],
        },
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Annadana Seva",
          url: `${SITE_URL}/`,
          description: DEFAULT_DESCRIPTION,
        },
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_ENTRIES.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        },
      ],
    };
  }

  if (pathname === "/thankyou") {
    return {
      title: "Donation Successful | Annadana Seva",
      description:
        "Thank you for supporting Annadana Seva and helping provide meals to needy people and families at government hospitals.",
      keywords: DEFAULT_KEYWORDS,
      robots: "noindex, nofollow",
      canonical: `${SITE_URL}/thankyou`,
    };
  }

  if (pathname === "/receipt-preview") {
    return {
      title: "Donation Receipt Preview | Annadana Seva",
      description: "Donation receipt preview for Annadana Seva.",
      keywords: DEFAULT_KEYWORDS,
      robots: "noindex, nofollow",
      canonical: `${SITE_URL}/receipt-preview`,
    };
  }

  if (
    pathname.startsWith("/admin") ||
    pathname === "/x7k9m2p5q8w3"
  ) {
    return {
      title: "Admin | Annadana Seva",
      description: "Administrative area for Annadana Seva.",
      keywords: DEFAULT_KEYWORDS,
      robots: "noindex, nofollow",
      canonical: `${SITE_URL}${pathname}`,
    };
  }

  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    keywords: DEFAULT_KEYWORDS,
    robots: "index, follow",
    canonical: `${SITE_URL}${pathname}`,
  };
}

function SeoManager() {
  const location = useLocation();

  useEffect(() => {
    const seo = getPageSeo(location.pathname);

    document.title = seo.title;

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: seo.description,
    });
    upsertMeta('meta[name="keywords"]', {
      name: "keywords",
      content: seo.keywords,
    });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: seo.robots,
    });
    upsertMeta('meta[name="googlebot"]', {
      name: "googlebot",
      content:
        seo.robots === "index, follow"
          ? "index, follow, max-image-preview:large"
          : seo.robots,
    });
    upsertLink('link[rel="canonical"]', {
      rel: "canonical",
      href: seo.canonical,
    });

    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: "website",
    });
    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: "Annadana Seva",
    });
    upsertMeta('meta[property="og:locale"]', {
      property: "og:locale",
      content: "en_IN",
    });
    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: seo.title,
    });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: seo.description,
    });
    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: seo.canonical,
    });
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: DEFAULT_IMAGE,
    });
    upsertMeta('meta[property="og:image:alt"]', {
      property: "og:image:alt",
      content: "Annadana Seva hospital meal donation program",
    });

    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: seo.title,
    });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: seo.description,
    });
    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: DEFAULT_IMAGE,
    });

    if (seo.structuredData) {
      upsertJsonLd("seo-structured-data", seo.structuredData);
    } else {
      removeJsonLd("seo-structured-data");
    }
  }, [location.pathname]);

  return null;
}

export default SeoManager;
