import { useState, useEffect } from "react"
import { Image as ImageIcon, Upload, Trash2, Copy, Power } from "lucide-react"
import adminAPI from "../../services/adminApi"

function FestivalCampaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [utmCampaign, setUtmCampaign] = useState("")
  const [desktopFile, setDesktopFile] = useState(null)
  const [mobileFile, setMobileFile] = useState(null)
  const [desktopPreview, setDesktopPreview] = useState(null)
  const [mobilePreview, setMobilePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const res = await adminAPI.request("/api/admin/festival-campaigns")
      setCampaigns(res.campaigns || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCampaigns() }, [])

  const handleFileChange = (file, type) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    if (type === "desktop") { setDesktopFile(file); setDesktopPreview(url) }
    else { setMobileFile(file); setMobilePreview(url) }
  }

  const handleSubmit = async () => {
    if (!name || !utmCampaign || !desktopFile || !mobileFile) {
      alert("Please fill campaign name, UTM key, and upload both images")
      return
    }
    setSubmitting(true)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("utmCampaign", utmCampaign)
      formData.append("desktopImage", desktopFile)
      formData.append("mobileImage", mobileFile)

      const res = await adminAPI.uploadFestivalCampaign(formData)
      setResult({ success: true, generatedUrl: res.generatedUrl })
      setName(""); setUtmCampaign(""); setDesktopFile(null); setMobileFile(null)
      setDesktopPreview(null); setMobilePreview(null)
      fetchCampaigns()
    } catch (e) {
      setResult({ success: false, message: e.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (id) => {
    try {
      await adminAPI.request(`/api/admin/festival-campaigns/${id}/toggle`, { method: "PATCH" })
      fetchCampaigns()
    } catch (e) {
      alert("Failed: " + e.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this festival campaign banner?")) return
    try {
      await adminAPI.request(`/api/admin/festival-campaigns/${id}`, { method: "DELETE" })
      fetchCampaigns()
    } catch (e) {
      alert("Failed: " + e.message)
    }
  }

  const copyUrl = (campaign) => {
    const baseUrl = "https://annadan.harekrishnavizag.org"
    const url = `${baseUrl}?utm_source=meta&utm_medium=paid_social&utm_campaign=${campaign.utmCampaign}`
    navigator.clipboard.writeText(url)
    setCopiedId(campaign._id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const s = {
    page: { padding: "24px", maxWidth: "900px" },
    title: { fontSize: "22px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 6px", display: "flex", alignItems: "center", gap: "10px" },
    sub: { color: "#888", fontSize: "14px", marginBottom: "24px" },
    box: { background: "white", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "22px", marginBottom: "20px" },
    label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#444", marginBottom: "6px" },
    input: { width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", boxSizing: "border-box" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" },
    uploadBox: { border: "2px dashed #d1d5db", borderRadius: "12px", padding: "16px", textAlign: "center", cursor: "pointer", position: "relative", minHeight: "140px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  }

  return (
    <div style={s.page}>
      <h1 style={s.title}><ImageIcon size={22} color="#0A97EF" /> Festival Banners</h1>
      <p style={s.sub}>Create image banners for festival UTM campaigns. Upload separate images for desktop and mobile — the correct one shows automatically based on visitor's device.</p>

      {/* Create Form */}
      <div style={s.box}>
        <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Create New Campaign Banner</h3>

        <div style={s.grid2}>
          <div>
            <label style={s.label}>Campaign Name</label>
            <input style={s.input} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ratha Yatra 2026" />
          </div>
          <div>
            <label style={s.label}>UTM Campaign Key</label>
            <input style={s.input} value={utmCampaign} onChange={e => setUtmCampaign(e.target.value)} placeholder="e.g. ratha-yatra-2026" />
          </div>
        </div>

        <div style={s.grid2}>
          <div>
            <label style={s.label}>Desktop Banner Image</label>
            <label style={s.uploadBox}>
              {desktopPreview ? (
                <img src={desktopPreview} alt="Desktop preview" style={{ maxWidth: "100%", maxHeight: "110px", borderRadius: "8px" }} />
              ) : (
                <>
                  <Upload size={22} color="#aaa" />
                  <span style={{ fontSize: "12px", color: "#888", marginTop: "6px" }}>Click to upload (wide banner)</span>
                </>
              )}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFileChange(e.target.files[0], "desktop")} />
            </label>
          </div>
          <div>
            <label style={s.label}>Mobile Banner Image</label>
            <label style={s.uploadBox}>
              {mobilePreview ? (
                <img src={mobilePreview} alt="Mobile preview" style={{ maxWidth: "100%", maxHeight: "110px", borderRadius: "8px" }} />
              ) : (
                <>
                  <Upload size={22} color="#aaa" />
                  <span style={{ fontSize: "12px", color: "#888", marginTop: "6px" }}>Click to upload (compact banner)</span>
                </>
              )}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFileChange(e.target.files[0], "mobile")} />
            </label>
          </div>
        </div>

        {result && (
          <div style={{
            padding: "12px 16px", borderRadius: "10px", marginBottom: "14px", fontSize: "13px",
            background: result.success ? "#f0fdf4" : "#fef2f2",
            color: result.success ? "#166534" : "#991b1b",
            border: `1px solid ${result.success ? "#86efac" : "#fca5a5"}`
          }}>
            {result.success ? (
              <>✅ Created! Campaign URL: <strong>{result.generatedUrl}</strong></>
            ) : (
              <>❌ {result.message}</>
            )}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            background: submitting ? "#e5e7eb" : "#0A97EF", color: submitting ? "#888" : "white",
            border: "none", borderRadius: "12px", padding: "12px 28px",
            fontSize: "14px", fontWeight: "700", cursor: submitting ? "not-allowed" : "pointer"
          }}
        >
          {submitting ? "Uploading..." : "Create Campaign Banner"}
        </button>
      </div>

      {/* List */}
      <div style={s.box}>
        <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Existing Campaigns</h3>
        {loading ? (
          <p style={{ color: "#888" }}>Loading...</p>
        ) : campaigns.length === 0 ? (
          <p style={{ color: "#888" }}>No festival campaigns created yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {campaigns.map(c => (
              <div key={c._id} style={{
                display: "flex", alignItems: "center", gap: "14px",
                border: "1px solid #eee", borderRadius: "12px", padding: "12px 14px"
              }}>
                <img src={c.desktopImageUrl} alt={c.name} style={{ width: "90px", height: "50px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: "700", fontSize: "14px", color: "#1a1a2e" }}>{c.name}</div>
                  <div style={{ fontSize: "12px", color: "#888", fontFamily: "monospace" }}>{c.utmCampaign}</div>
                </div>
                <span style={{
                  fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "999px",
                  background: c.isActive ? "#f0fdf4" : "#f3f4f6",
                  color: c.isActive ? "#16a34a" : "#888"
                }}>
                  {c.isActive ? "Active" : "Inactive"}
                </span>
                <button onClick={() => copyUrl(c)} title="Copy campaign URL" style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px", cursor: "pointer", color: copiedId === c._id ? "#16a34a" : "#555" }}>
                  <Copy size={15} />
                </button>
                <button onClick={() => handleToggle(c._id)} title="Toggle active" style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px", cursor: "pointer", color: "#555" }}>
                  <Power size={15} />
                </button>
                <button onClick={() => handleDelete(c._id)} title="Delete" style={{ background: "none", border: "1px solid #fca5a5", borderRadius: "8px", padding: "8px", cursor: "pointer", color: "#dc2626" }}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FestivalCampaigns
