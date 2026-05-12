function getCookie(name) {
  if (typeof document === "undefined") {
    return "";
  }

  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1] || "";
}

function getMetaBrowserIds() {
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get("fbclid");
  const fbc = getCookie("_fbc") || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : "");

  return {
    fbp: getCookie("_fbp"),
    fbc,
  };
}

/**
 * Detect source from document.referrer when no UTM is present
 */
function detectReferrerSource() {
  const ref = document.referrer;
  if (!ref) return { source: "direct", medium: "none" };

  try {
    const url = new URL(ref);
    const host = url.hostname.toLowerCase();

    if (host.includes("facebook.com") || host.includes("fb.com") || host.includes("fb.me")) {
      return { source: "facebook", medium: "social" };
    }
    if (host.includes("instagram.com")) {
      return { source: "instagram", medium: "social" };
    }
    if (host.includes("whatsapp.com") || host.includes("wa.me")) {
      return { source: "whatsapp", medium: "social" };
    }
    if (host.includes("google.com") || host.includes("google.co.in")) {
      return { source: "google", medium: "organic" };
    }
    if (host.includes("youtube.com")) {
      return { source: "youtube", medium: "social" };
    }
    if (host.includes("twitter.com") || host.includes("t.co")) {
      return { source: "twitter", medium: "social" };
    }
    if (host.includes("linkedin.com")) {
      return { source: "linkedin", medium: "social" };
    }
    if (host.includes("t.me") || host.includes("telegram.org")) {
      return { source: "telegram", medium: "social" };
    }

    return { source: host, medium: "referral" };
  } catch {
    return { source: "unknown", medium: "referral" };
  }
}

/**
 * Capture and store all tracking data from the current URL.
 * Priority: UTM params > ref/slug param > path slug > referrer > direct
 * Stored in sessionStorage so it persists through the session but resets on new visit.
 */
function captureTrackingData() {
  const params = new URLSearchParams(window.location.search);
  const pathname = window.location.pathname;

  // 1. Full UTM params
  const hasUtm = params.get("utm_source") || params.get("utm_campaign");
  if (hasUtm) {
    const utmData = {
      source: params.get("utm_source") || "unknown",
      medium: params.get("utm_medium") || "",
      campaign: params.get("utm_campaign") || "",
      content: params.get("utm_content") || "",
      term: params.get("utm_term") || "",
      _trackingType: "utm",
    };
    sessionStorage.setItem("utm", JSON.stringify(utmData));
    return utmData;
  }

  // 2. ref or slug param — e.g. ?ref=ekadashi-may or ?slug=temple-trust
  const refParam = params.get("ref") || params.get("slug") || params.get("via");
  if (refParam) {
    const utmData = {
      source: "link",
      medium: "referral",
      campaign: refParam,
      content: "",
      term: "",
      _trackingType: "ref",
    };
    sessionStorage.setItem("utm", JSON.stringify(utmData));
    return utmData;
  }

  // 3. Path-based slug — e.g. /c/ekadashi-may
  const slugMatch = pathname.match(/^\/c\/([a-zA-Z0-9_-]+)/);
  if (slugMatch) {
    const utmData = {
      source: "link",
      medium: "slug",
      campaign: slugMatch[1],
      content: "",
      term: "",
      _trackingType: "slug",
    };
    sessionStorage.setItem("utm", JSON.stringify(utmData));
    return utmData;
  }

  // 4. Already stored in sessionStorage (user navigated within same session)
  try {
    const stored = JSON.parse(sessionStorage.getItem("utm"));
    if (stored && stored.source) return stored;
  } catch {}

  // 5. Auto-detect from referrer
  const { source, medium } = detectReferrerSource();

  // 6. Always record which domain the donation came from
  const hostname = window.location.hostname;
  let domainSource = source;
  let domainMedium = medium;

  if (source === "direct" || source === "unknown") {
    // No referrer — record the domain itself as source
    if (hostname.includes("donations.harekrishnavizag")) {
      domainSource = "donations-site";
      domainMedium = "organic";
    } else if (hostname.includes("annadan.harekrishnavizag")) {
      domainSource = "annadan-site";
      domainMedium = "organic";
    } else if (hostname.includes("iskconcharity")) {
      domainSource = "iskconcharity-site";
      domainMedium = "organic";
    } else {
      domainSource = hostname || "direct";
      domainMedium = "organic";
    }
  }

  const utmData = {
    source: domainSource,
    medium: domainMedium,
    campaign: "",
    content: "",
    term: "",
    _trackingType: "auto",
  };
  sessionStorage.setItem("utm", JSON.stringify(utmData));
  return utmData;
}

/**
 * Read stored tracking data (call this when submitting donation)
 */
function getStoredTracking() {
  try {
    const data = JSON.parse(sessionStorage.getItem("utm"));
    return data || null;
  } catch {
    return null;
  }
}

export { getMetaBrowserIds, captureTrackingData, getStoredTracking };
