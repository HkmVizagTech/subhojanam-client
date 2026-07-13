import { useState, useEffect } from "react";
import { apiBaseUrl } from "../lib/apiConfig";

function FestivalBanner() {
  const [campaign, setCampaign] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const utmCampaign = params.get("utm_campaign");
      if (!utmCampaign) return;

      fetch(apiBaseUrl(`/api/public/festival-campaign?utmCampaign=${encodeURIComponent(utmCampaign)}`))
        .then(res => res.json())
        .then(data => {
          if (data.success && data.campaign) setCampaign(data.campaign);
        })
        .catch(() => {
          // no-op — banner simply won't show if fetch fails
        });
    } catch {
      // no-op
    }
  }, []);

  if (!campaign || dismissed) return null;

  const handleClick = () => {
    const el = document.getElementById("donate");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ position: "relative", width: "100%", cursor: "pointer" }} onClick={handleClick}>
      <picture>
        <source media="(max-width: 640px)" srcSet={campaign.mobileImageUrl} />
        <img
          src={campaign.desktopImageUrl}
          alt={campaign.name}
          style={{ width: "100%", display: "block" }}
        />
      </picture>

      <button
        onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
        aria-label="Dismiss"
        style={{
          position: "absolute",
          top: "10px",
          right: "12px",
          background: "rgba(0,0,0,0.45)",
          border: "none",
          color: "#fff",
          fontSize: "18px",
          lineHeight: 1,
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          cursor: "pointer",
        }}
      >
        ×
      </button>
    </div>
  );
}

export default FestivalBanner;
