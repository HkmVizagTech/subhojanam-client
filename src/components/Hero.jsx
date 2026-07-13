import { useState, useEffect } from "react"
import { apiBaseUrl } from "../lib/apiConfig"
import "../styles/hero.css"

function Hero() {
  const [festivalCampaign, setFestivalCampaign] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

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
        .catch(() => {})
    } catch {}
  }, [])

  const handleClick = () => {
    const el = document.getElementById("donate") || document.getElementById("donation-section") || document.querySelector(".main-section")
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // Festival campaign active — render a full <img> that auto-sizes to the
  // image's natural dimensions. No gaps, no cropping, works with any size.
  if (festivalCampaign) {
    const src = isMobile ? festivalCampaign.mobileImageUrl : festivalCampaign.desktopImageUrl
    return (
      <div
        onClick={handleClick}
        role="button"
        aria-label="Scroll to donation section"
        style={{ cursor: "pointer", width: "100%", lineHeight: 0 }}
      >
        <img
          src={src}
          alt={festivalCampaign.name}
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>
    )
  }

  // Default — regular CSS hero, no change
  return (
    <section
      className="hero"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
      role="button"
      aria-label="Scroll to donation section"
    />
  )
}

export default Hero
