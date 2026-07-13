import { useState, useEffect } from "react"
import { apiBaseUrl } from "../lib/apiConfig"
import "../styles/hero.css"

function Hero() {
  const [festivalCampaign, setFestivalCampaign] = useState(null)

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const utmCampaign = params.get("utm_campaign")
      if (!utmCampaign) return

      fetch(apiBaseUrl(`/api/public/festival-campaign?utmCampaign=${encodeURIComponent(utmCampaign)}`))
        .then(res => res.json())
        .then(data => {
          if (data.success && data.campaign) setFestivalCampaign(data.campaign)
        })
        .catch(() => {
          // no-op — Hero simply keeps its default image if fetch fails
        })
    } catch {
      // no-op
    }
  }, [])

  const handleClick = () => {
    const donationSection = document.getElementById("donate") || document.getElementById("donation-section") || document.querySelector('.main-section');
    if (donationSection) {
      donationSection.scrollIntoView({ behavior: "smooth", block: 'start' });
    }
  };

  // When a festival campaign is active, override the CSS background image
  // with the campaign's own desktop/mobile images. Use `contain` (not `cover`)
  // so the full creative is always visible, regardless of its exact aspect
  // ratio — the hero's navy background fills any remaining space.
  const heroStyle = festivalCampaign
    ? {
        backgroundImage: `url(${festivalCampaign.desktopImageUrl})`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        cursor: "pointer",
      }
    : { cursor: "pointer" };

  return (
    <>
      {festivalCampaign && (
        <style>{`
          @media (max-width: 768px) {
            .hero {
              background-image: url(${festivalCampaign.mobileImageUrl}) !important;
              background-size: contain !important;
              background-repeat: no-repeat !important;
              background-position: center !important;
            }
          }
        `}</style>
      )}
      <section
        className="hero"
        onClick={handleClick}
        style={heroStyle}
        role="button"
        aria-label="Scroll to donation section"
      />
    </>
  );
}

export default Hero
