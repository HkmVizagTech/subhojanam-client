import { useState, useEffect } from "react";
import { FESTIVAL_BANNERS } from "../config/festivalBanners";

function FestivalBanner() {
  const [festival, setFestival] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const campaign = params.get("utm_campaign");
      if (campaign && FESTIVAL_BANNERS[campaign]) {
        setFestival(FESTIVAL_BANNERS[campaign]);
      }
    } catch {
      // no-op — banner simply won't show if anything goes wrong
    }
  }, []);

  if (!festival || dismissed) return null;

  return (
    <div
      style={{
        background: `linear-gradient(120deg, ${festival.accentColor}, ${festival.accentColor}dd)`,
        color: "#fff",
        padding: "14px 20px",
        textAlign: "center",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "700px", margin: "0 auto", paddingRight: "28px" }}>
        <span
          style={{
            display: "inline-block",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            background: "rgba(255,255,255,0.18)",
            padding: "3px 10px",
            borderRadius: "999px",
            marginBottom: "6px",
          }}
        >
          {festival.badge}
        </span>
        <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "2px" }}>
          {festival.headline}
        </div>
        <div style={{ fontSize: "13px", opacity: 0.92, lineHeight: 1.4 }}>
          {festival.subtext}
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        style={{
          position: "absolute",
          top: "10px",
          right: "14px",
          background: "none",
          border: "none",
          color: "#fff",
          fontSize: "18px",
          lineHeight: 1,
          cursor: "pointer",
          opacity: 0.85,
        }}
      >
        ×
      </button>
    </div>
  );
}

export default FestivalBanner;
