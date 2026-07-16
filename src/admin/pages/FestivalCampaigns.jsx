import { useState, useEffect } from "react"
import { Image as ImageIcon, Upload, Trash2, Copy, Power, Pencil, X, Check } from "lucide-react"
import adminAPI from "../../services/adminApi"

function FestivalCampaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [utmCampaign, setUtmCampaign] = useState("")
  const [primaryColor, setPrimaryColor] = useState("#5C1A1B")
  const [accentColor, setAccentColor] = useState("#8B2E2E")
  const [bgColor, setBgColor] = useState("#FDF3E3")
  const [minDonationAmount, setMinDonationAmount] = useState(100)
  const [desktopFile, setDesktopFile] = useState(null)
  const [mobileFile, setMobileFile] = useState(null)
  const [desktopPreview, setDesktopPreview] = useState(null)
  const [mobilePreview, setMobilePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState("")
  const [editPrimary, setEditPrimary] = useState("#5C1A1B")
  const [editAccent, setEditAccent] = useState("#8B2E2E")
  const [editBg, setEditBg] = useState("#FDF3E3")
  const [editMinAmount, setEditMinAmount] = useState(100)
  const [editDesktopFile, setEditDesktopFile] = useState(null)
  const [editMobileFile, setEditMobileFile] = useState(null)
  const [editDesktopPreview, setEditDesktopPreview] = useState(null)
  const [editMobilePreview, setEditMobilePreview] = useState(null)
  const [editSubmitting, setEditSubmitting] = useState(false)

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
      formData.append("primaryColor", primaryColor)
      formData.append("accentColor", accentColor)
      formData.append("bgColor", bgColor)
      formData.append("minDonationAmount", minDonationAmount)
      formData.append("desktopImage", desktopFile)
      formData.append("mobileImage", mobileFile)

      const res = await adminAPI.uploadFestivalCampaign(formData)
      setResult({ success: true, generatedUrl: res.generatedUrl })
      setName(""); setUtmCampaign(""); setDesktopFile(null); setMobileFile(null)
      setDesktopPreview(null); setMobilePreview(null)
      setPrimaryColor("#5C1A1B"); setAccentColor("#8B2E2E"); setBgColor("#FDF3E3")
      setMinDonationAmount(100)
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

  const startEdit = (campaign) => {
    setEditingId(campaign._id)
    setEditName(campaign.name)
    setEditPrimary(campaign.theme?.primaryColor || "#5C1A1B")
    setEditAccent(campaign.theme?.accentColor   || "#8B2E2E")
    setEditBg(campaign.theme?.bgColor           || "#FDF3E3")
    setEditMinAmount(campaign.minDonationAmount || 100)
    setEditDesktopFile(null)
    setEditMobileFile(null)
    setEditDesktopPreview(campaign.desktopImageUrl)
    setEditMobilePreview(campaign.mobileImageUrl)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditDesktopFile(null)
    setEditMobileFile(null)
    setEditDesktopPreview(null)
    setEditMobilePreview(null)
  }

  const handleEditFileChange = (file, type) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    if (type === "desktop") { setEditDesktopFile(file); setEditDesktopPreview(url) }
    else { setEditMobileFile(file); setEditMobilePreview(url) }
  }

  const handleUpdate = async (id) => {
    setEditSubmitting(true)
    try {
      const formData = new FormData()
      if (editName) formData.append("name", editName)
      formData.append("primaryColor", editPrimary)
      formData.append("accentColor",  editAccent)
      formData.append("bgColor",      editBg)
      formData.append("minDonationAmount", editMinAmount)
      if (editDesktopFile) formData.append("desktopImage", editDesktopFile)
      if (editMobileFile) formData.append("mobileImage", editMobileFile)

      await adminAPI.updateFestivalCampaign(id, formData)
      cancelEdit()
      fetchCampaigns()
    } catch (e) {
      alert("Update failed: " + e.message)
    } finally {
      setEditSubmitting(false)
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "16px" }}>
          <div>
            <label style={s.label}>Campaign Name</label>
            <input style={s.input} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ratha Yatra 2026" />
          </div>
          <div>
            <label style={s.label}>UTM Campaign Key</label>
            <input style={s.input} value={utmCampaign} onChange={e => setUtmCampaign(e.target.value)} placeholder="e.g. ratha-yatra-2026" />
          </div>
          <div>
            <label style={s.label}>Minimum Donation (₹)</label>
            <input type="number" min="1" style={s.input} value={minDonationAmount} onChange={e => setMinDonationAmount(e.target.value)} placeholder="100" />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "16px" }}>
          <div>
            <label style={s.label}>Primary Color <span style={{ color: "#aaa", fontWeight: 400 }}>(buttons, headings)</span></label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ width: "42px", height: "42px", borderRadius: "8px", border: "1px solid #e5e7eb", cursor: "pointer", padding: "2px" }} />
              <input style={{ ...s.input, fontFamily: "monospace", fontSize: "13px" }} value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} maxLength={7} />
            </div>
          </div>
          <div>
            <label style={s.label}>Accent Color <span style={{ color: "#aaa", fontWeight: 400 }}>(button gradient)</span></label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ width: "42px", height: "42px", borderRadius: "8px", border: "1px solid #e5e7eb", cursor: "pointer", padding: "2px" }} />
              <input style={{ ...s.input, fontFamily: "monospace", fontSize: "13px" }} value={accentColor} onChange={e => setAccentColor(e.target.value)} maxLength={7} />
            </div>
          </div>
          <div>
            <label style={s.label}>Page Background <span style={{ color: "#aaa", fontWeight: 400 }}>(donation section)</span></label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: "42px", height: "42px", borderRadius: "8px", border: "1px solid #e5e7eb", cursor: "pointer", padding: "2px" }} />
              <input style={{ ...s.input, fontFamily: "monospace", fontSize: "13px" }} value={bgColor} onChange={e => setBgColor(e.target.value)} maxLength={7} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", padding: "12px 14px", background: primaryColor + "18", borderRadius: "12px", border: `1px solid ${primaryColor}40` }}>
          <span style={{ fontSize: "13px", color: "#555" }}>Preview:</span>
          <button style={{ background: `linear-gradient(135deg, ${accentColor}, ${primaryColor})`, color: "#fff", border: "none", borderRadius: "10px", padding: "10px 22px", fontWeight: 700, fontSize: "14px", cursor: "default" }}>Donate Now</button>
          <span style={{ fontSize: "14px", fontWeight: 700, color: primaryColor }}>Support Annadana Seva</span>
        </div>

        <div style={s.grid2}>
          <div>
            <label style={s.label}>Desktop Banner Image <span style={{ color: "#aaa", fontWeight: "400" }}>(16:9 · 1920×1080px)</span></label>
            <label style={s.uploadBox}>
              {desktopPreview ? (
                <img src={desktopPreview} alt="Desktop preview" style={{ maxWidth: "100%", maxHeight: "110px", borderRadius: "8px" }} />
              ) : (
                <>
                  <Upload size={22} color="#aaa" />
                  <span style={{ fontSize: "12px", color: "#888", marginTop: "6px" }}>Click to upload (landscape, wide)</span>
                </>
              )}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFileChange(e.target.files[0], "desktop")} />
            </label>
          </div>
          <div>
            <label style={s.label}>Mobile Banner Image <span style={{ color: "#aaa", fontWeight: "400" }}>(9:16 · 1080×1920px)</span></label>
            <label style={s.uploadBox}>
              {mobilePreview ? (
                <img src={mobilePreview} alt="Mobile preview" style={{ maxWidth: "100%", maxHeight: "110px", borderRadius: "8px" }} />
              ) : (
                <>
                  <Upload size={22} color="#aaa" />
                  <span style={{ fontSize: "12px", color: "#888", marginTop: "6px" }}>Click to upload (portrait, tall)</span>
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
              <div key={c._id} style={{ border: "1px solid #eee", borderRadius: "12px", padding: "12px 14px" }}>
                {editingId === c._id ? (
                  <div>
                    <div style={{ marginBottom: "10px" }}>
                      <label style={{ ...s.label, fontSize: "12px" }}>Campaign Name</label>
                      <input style={s.input} value={editName} onChange={e => setEditName(e.target.value)} />
                    </div>
                    <div style={{ marginBottom: "10px", maxWidth: "220px" }}>
                      <label style={{ ...s.label, fontSize: "12px" }}>Minimum Donation (₹)</label>
                      <input type="number" min="1" style={s.input} value={editMinAmount} onChange={e => setEditMinAmount(e.target.value)} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                      {[
                        { label: "Primary", val: editPrimary, set: setEditPrimary },
                        { label: "Accent", val: editAccent, set: setEditAccent },
                        { label: "Background", val: editBg, set: setEditBg },
                      ].map(({ label, val, set }) => (
                        <div key={label}>
                          <label style={{ ...s.label, fontSize: "11px" }}>{label}</label>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <input type="color" value={val} onChange={e => set(e.target.value)} style={{ width: "36px", height: "36px", borderRadius: "6px", border: "1px solid #e5e7eb", cursor: "pointer", padding: "2px" }} />
                            <input style={{ ...s.input, fontFamily: "monospace", fontSize: "12px", padding: "6px 8px" }} value={val} onChange={e => set(e.target.value)} maxLength={7} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                      <div>
                        <label style={{ ...s.label, fontSize: "12px" }}>Desktop Image <span style={{ color: "#aaa", fontWeight: "400" }}>(16:9)</span></label>
                        <label style={{ ...s.uploadBox, minHeight: "90px" }}>
                          <img src={editDesktopPreview} alt="Desktop" style={{ maxWidth: "100%", maxHeight: "70px", borderRadius: "6px" }} />
                          <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleEditFileChange(e.target.files[0], "desktop")} />
                        </label>
                      </div>
                      <div>
                        <label style={{ ...s.label, fontSize: "12px" }}>Mobile Image <span style={{ color: "#aaa", fontWeight: "400" }}>(9:16)</span></label>
                        <label style={{ ...s.uploadBox, minHeight: "90px" }}>
                          <img src={editMobilePreview} alt="Mobile" style={{ maxWidth: "100%", maxHeight: "70px", borderRadius: "6px" }} />
                          <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleEditFileChange(e.target.files[0], "mobile")} />
                        </label>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => handleUpdate(c._id)} disabled={editSubmitting} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#16a34a", color: "white", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                        <Check size={14} /> {editSubmitting ? "Saving..." : "Save"}
                      </button>
                      <button onClick={cancelEdit} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", cursor: "pointer", color: "#888" }}>
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
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
                    <button onClick={() => startEdit(c)} title="Edit" style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px", cursor: "pointer", color: "#0A97EF" }}>
                      <Pencil size={15} />
                    </button>
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
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FestivalCampaigns
