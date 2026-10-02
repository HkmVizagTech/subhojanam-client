import { useState, useEffect } from "react"
import { Search, Mail, Phone, MapPin, Calendar, Package, X } from "lucide-react"
import adminAPI from "../../services/adminApi"
import "../styles/Donors.css"

function Donors() {
  const [donors, setDonors] = useState([])
  const [stats, setStats] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [prasadamModalDonor, setPrasadamModalDonor] = useState(null)
  const [prasadamForm, setPrasadamForm] = useState({
    prasadamName: "", prasadamMobile: "",
    prasadamAddress: "", prasadamCity: "", prasadamState: "", prasadamPincode: "",
  })
  const [submittingPrasadam, setSubmittingPrasadam] = useState(false)
  const [prasadamResult, setPrasadamResult] = useState(null)

  const openPrasadamModal = (donor) => {
    setPrasadamModalDonor(donor)
    setPrasadamResult(null)
    setPrasadamForm({
      prasadamName: donor.name || "",
      prasadamMobile: donor.mobile || "",
      prasadamAddress: "", prasadamCity: "", prasadamState: "", prasadamPincode: "",
    })
  }

  const closePrasadamModal = () => {
    setPrasadamModalDonor(null)
    setPrasadamResult(null)
  }

  const submitPrasadamRequest = async () => {
    if (!prasadamForm.prasadamAddress || !prasadamForm.prasadamCity || !prasadamForm.prasadamState || !prasadamForm.prasadamPincode) {
      setPrasadamResult({ success: false, message: "Please fill the full delivery address" })
      return
    }
    setSubmittingPrasadam(true)
    setPrasadamResult(null)
    try {
      const res = await adminAPI.request("/api/admin/donors/request-prasadam", {
        method: "POST",
        body: JSON.stringify({
          email: prasadamModalDonor.email,
          mobile: prasadamModalDonor.mobile,
          ...prasadamForm,
        }),
      })
      setPrasadamResult({ success: true, message: res.message })
    } catch (e) {
      setPrasadamResult({ success: false, message: e.message })
    } finally {
      setSubmittingPrasadam(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDonors()
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchDonors = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getAllDonors({
        search: searchTerm,
        limit: 20
      })

      setDonors(response.donors)
      setError(null)
    } catch (err) {
      console.error("Error fetching donors:", err)
      setError("Failed to load donors")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getDonorStats()
      setStats(response.stats)
    } catch (err) {
      console.error("Error fetching stats:", err)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN')
  }

  const isActiveThisMonth = (lastDonation) => {
    const lastDate = new Date(lastDonation)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return lastDate > thirtyDaysAgo
  }

  return (
    <div className="donors-page">
      <div className="page-header">
        <div>
          <h1>Donors Management</h1>
          <p>View and manage your donor community</p>
        </div>
      </div>

      <div className="donors-stats">
        <div className="stat-box">
          <p>Total Donors</p>
          <h3>{stats?.totalDonors || 0}</h3>
        </div>
        <div className="stat-box">
          <p>Active This Month</p>
          <h3>{stats?.activeThisMonth || 0}</h3>
        </div>
        <div className="stat-box">
          <p>Total Contributions</p>
          <h3>₹{(stats?.totalContributions || 0).toLocaleString()}</h3>
        </div>
      </div>

      <div className="search-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search donors by name, email, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading donors...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
          <p>{error}</p>
          <button onClick={fetchDonors}>Retry</button>
        </div>
      ) : (
        <>
          <div className="donors-grid">
            {donors.map((donor) => (
              <div key={donor.id} className="donor-card">
                <div className="donor-card-header">
                  <div className="donor-avatar">{donor.name.charAt(0)}</div>
                  <div className="donor-info">
                    <h3>{donor.name}</h3>
                    <div className="donor-contact">
                      <span><Mail size={14} /> {donor.email}</span>
                      <span><Phone size={14} /> {donor.mobile}</span>
                    </div>
                  </div>
                </div>

                <div className="donor-card-body">
                  <div className="donor-stat">
                    <p>Total Donations</p>
                    <h4>₹{donor.totalDonations.toLocaleString()}</h4>
                  </div>
                  <div className="donor-stat">
                    <p>Number of Donations</p>
                    <h4>{donor.donations}</h4>
                  </div>
                </div>

                <div className="donor-card-footer">
                  <div className="donor-meta">
                    <span><Calendar size={14} /> Joined {formatDate(donor.joinedDate)}</span>
                  </div>
                  <div className="last-donation">
                    Last donation: {formatDate(donor.lastDonation)}
                  </div>
                </div>

                <div className="donor-actions">
                  <button className="view-details-btn">View Details</button>
                  <button className="contact-btn">Contact</button>
                  <button
                    onClick={() => openPrasadamModal(donor)}
                    style={{ display: "flex", alignItems: "center", gap: "6px", background: "#7c3aed", color: "white", border: "none", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
                  >
                    <Package size={14} /> Add Prasadam
                  </button>
                </div>
              </div>
            ))}
          </div>

          {donors.length === 0 && (
            <div className="no-results">
              <p>No donors found matching your search criteria</p>
            </div>
          )}
        </>
      )}

      {prasadamModalDonor && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", maxWidth: "440px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "700", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Package size={18} color="#7c3aed" /> Add Prasadam Request
              </h3>
              <button onClick={closePrasadamModal} style={{ background: "none", border: "none", cursor: "pointer", color: "#888" }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: "13px", color: "#888", marginBottom: "16px" }}>
              For <strong>{prasadamModalDonor.name}</strong> — this will appear in Prasadam &gt; Pending for dispatch.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input
                placeholder="Recipient name"
                value={prasadamForm.prasadamName}
                onChange={e => setPrasadamForm({ ...prasadamForm, prasadamName: e.target.value })}
                style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "14px" }}
              />
              <input
                placeholder="Recipient mobile"
                value={prasadamForm.prasadamMobile}
                onChange={e => setPrasadamForm({ ...prasadamForm, prasadamMobile: e.target.value })}
                style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "14px" }}
              />
              <textarea
                placeholder="Delivery address *"
                value={prasadamForm.prasadamAddress}
                onChange={e => setPrasadamForm({ ...prasadamForm, prasadamAddress: e.target.value })}
                rows={2}
                style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "14px", resize: "vertical", fontFamily: "inherit" }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <input
                  placeholder="City *"
                  value={prasadamForm.prasadamCity}
                  onChange={e => setPrasadamForm({ ...prasadamForm, prasadamCity: e.target.value })}
                  style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "14px" }}
                />
                <input
                  placeholder="State *"
                  value={prasadamForm.prasadamState}
                  onChange={e => setPrasadamForm({ ...prasadamForm, prasadamState: e.target.value })}
                  style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "14px" }}
                />
              </div>
              <input
                placeholder="Pincode *"
                value={prasadamForm.prasadamPincode}
                onChange={e => setPrasadamForm({ ...prasadamForm, prasadamPincode: e.target.value })}
                style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "14px" }}
              />
            </div>

            {prasadamResult && (
              <div style={{
                marginTop: "14px", padding: "10px 14px", borderRadius: "10px", fontSize: "13px",
                background: prasadamResult.success ? "#f0fdf4" : "#fef2f2",
                color: prasadamResult.success ? "#166534" : "#991b1b",
                border: `1px solid ${prasadamResult.success ? "#86efac" : "#fca5a5"}`,
              }}>
                {prasadamResult.success ? "✅ " : "❌ "}{prasadamResult.message}
              </div>
            )}

            <div style={{ display: "flex", gap: "8px", marginTop: "18px" }}>
              {prasadamResult?.success ? (
                <button onClick={closePrasadamModal} style={{ flex: 1, background: "#16a34a", color: "white", border: "none", borderRadius: "10px", padding: "11px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
                  Done
                </button>
              ) : (
                <>
                  <button onClick={closePrasadamModal} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "11px 18px", fontSize: "14px", cursor: "pointer", color: "#555" }}>
                    Cancel
                  </button>
                  <button
                    onClick={submitPrasadamRequest}
                    disabled={submittingPrasadam}
                    style={{ flex: 1, background: "#7c3aed", color: "white", border: "none", borderRadius: "10px", padding: "11px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}
                  >
                    {submittingPrasadam ? "Saving..." : "Add Prasadam Request"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Donors
