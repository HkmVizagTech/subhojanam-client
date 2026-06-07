import { useState, useEffect, useCallback } from "react"
import { Package, CheckCircle, RefreshCw, Download, Search, MapPin } from "lucide-react"
import adminAPI from "../../services/adminApi"

const API_BASE = import.meta.env.VITE_API_URL

function Prasadam() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ pending: 0, delivered: 0 })
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("pending")
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [selected, setSelected] = useState([])
  const [marking, setMarking] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        status: statusFilter,
      })
      if (search) params.set("search", search)
      const res = await adminAPI.request(`/api/admin/prasadam?${params.toString()}`)
      setItems(res.data || [])
      setStats(res.stats || { pending: 0, delivered: 0 })
      setPagination(res.pagination)
      setSelected([])
    } catch (err) {
      console.error("Prasadam fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, statusFilter, search])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setCurrentPage(1) }, 500)
    return () => clearTimeout(t)
  }, [searchInput])

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    const pendingIds = items.filter(i => i.deliveryStatus !== "delivered").map(i => i.id)
    setSelected(prev => prev.length === pendingIds.length ? [] : pendingIds)
  }

  const markDelivered = async (ids) => {
    const trackingNumbers = {}
    if (ids.length === 1) {
      const tn = window.prompt("Enter DTDC tracking number (leave empty if not available):", "")
      if (tn === null) return // cancelled
      if (tn.trim()) trackingNumbers[ids[0]] = tn.trim()
    } else {
      if (!window.confirm(`Mark ${ids.length} as dispatched and send WhatsApp notification? (Tracking numbers can be added individually)`)) return
    }
    try {
      setMarking(true)
      const res = await adminAPI.request("/api/admin/prasadam/mark-delivered", {
        method: "POST",
        body: JSON.stringify({ donationIds: ids, sendWhatsapp: true, trackingNumbers }),
      })
      alert(res.message)
      fetchData()
    } catch (err) {
      alert("Failed: " + err.message)
    } finally {
      setMarking(false)
    }
  }

  const handleExport = () => {
    const token = document.cookie.split("; ").find(c => c.startsWith("adminToken="))?.split("=")[1]
    window.open(`${API_BASE}/api/admin/prasadam/export?status=${statusFilter}`, "_blank")
  }

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a2e", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <Package size={24} color="#0A97EF" /> Prasadam Deliveries
          </h1>
          <p style={{ color: "#888", fontSize: "14px", marginTop: "6px" }}>Donors who opted for Maha Prasadam delivery.</p>
        </div>
        <button onClick={handleExport} style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "#f3f4f6", color: "#555", border: "1px solid #e5e7eb",
          borderRadius: "10px", padding: "10px 18px", fontSize: "13px", fontWeight: "600", cursor: "pointer"
        }}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "14px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "14px", padding: "14px 24px", minWidth: "140px" }}>
          <div style={{ fontSize: "12px", color: "#9a3412", fontWeight: "600" }}>PENDING</div>
          <div style={{ fontSize: "26px", fontWeight: "800", color: "#ea580c" }}>{stats.pending}</div>
        </div>
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "14px", padding: "14px 24px", minWidth: "140px" }}>
          <div style={{ fontSize: "12px", color: "#166534", fontWeight: "600" }}>DELIVERED</div>
          <div style={{ fontSize: "26px", fontWeight: "800", color: "#16a34a" }}>{stats.delivered}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {["pending", "delivered", "all"].map(st => (
            <button key={st} onClick={() => { setStatusFilter(st); setCurrentPage(1) }} style={{
              padding: "8px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: "600",
              cursor: "pointer", border: "none", textTransform: "capitalize",
              background: statusFilter === st ? "#0A97EF" : "#f3f4f6",
              color: statusFilter === st ? "white" : "#555"
            }}>{st}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "white", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "8px 12px", flex: 1, minWidth: "200px", maxWidth: "320px" }}>
          <Search size={15} color="#aaa" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search name or mobile..."
            style={{ border: "none", outline: "none", fontSize: "13px", width: "100%" }}
          />
        </div>
        {selected.length > 0 && (
          <button onClick={() => markDelivered(selected)} disabled={marking} style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "#22c55e", color: "white", border: "none",
            borderRadius: "10px", padding: "9px 18px", fontSize: "13px", fontWeight: "700", cursor: "pointer"
          }}>
            {marking ? <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle size={14} />}
            Mark {selected.length} Delivered
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#888", padding: "40px" }}>Loading...</p>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", background: "#f9fafb", borderRadius: "16px" }}>
          <Package size={36} color="#ccc" style={{ marginBottom: "10px" }} />
          <p style={{ color: "#888", margin: 0 }}>No prasadam deliveries found.</p>
        </div>
      ) : (
        <>
          {statusFilter === "pending" && items.length > 0 && (
            <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", fontSize: "13px", color: "#555", cursor: "pointer" }}>
              <input type="checkbox" checked={selected.length === items.filter(i => i.deliveryStatus !== "delivered").length && selected.length > 0} onChange={toggleSelectAll} />
              Select all on this page
            </label>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {items.map(item => (
              <div key={item.id} style={{
                background: "white", border: "1px solid #e5e7eb", borderRadius: "14px",
                padding: "16px 20px", display: "flex", gap: "14px", alignItems: "flex-start",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
              }}>
                {item.deliveryStatus !== "delivered" && (
                  <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleSelect(item.id)} style={{ marginTop: "4px", cursor: "pointer" }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                    <div>
                      <span style={{ fontWeight: "700", fontSize: "15px", color: "#1a1a2e" }}>{item.recipientName}</span>
                      <span style={{ marginLeft: "8px", fontSize: "12px", color: "#888" }}>{item.recipientMobile}</span>
                      <span style={{ marginLeft: "8px", background: item.isRecurring ? "#eff6ff" : "#f0fdf4", color: item.isRecurring ? "#1d4ed8" : "#15803d", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "600" }}>
                        {item.isRecurring ? "Monthly" : "One-time"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontWeight: "700", color: "#0A97EF" }}>₹{item.amount?.toLocaleString("en-IN")}</span>
                      <span style={{ fontSize: "12px", color: "#aaa" }}>{formatDate(item.date)}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginTop: "8px", fontSize: "13px", color: "#555" }}>
                    <MapPin size={14} color="#888" style={{ marginTop: "2px", flexShrink: 0 }} />
                    <span>
                      {[item.address, item.city, item.state, item.pincode].filter(Boolean).join(", ") || <span style={{ color: "#ef4444" }}>⚠️ No address available</span>}
                    </span>
                  </div>
                  {item.donorName !== item.recipientName && (
                    <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>Donor: {item.donorName} · {item.donorMobile}</div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
                  {item.deliveryStatus === "delivered" ? (
                    <span style={{ background: "#f0fdf4", color: "#16a34a", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", whiteSpace: "nowrap" }}>
                      ✅ Delivered
                    </span>
                  ) : (
                    <button onClick={() => markDelivered([item.id])} disabled={marking} style={{
                      background: "#0A97EF", color: "white", border: "none",
                      borderRadius: "8px", padding: "8px 14px", fontSize: "12px",
                      fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap"
                    }}>
                      Mark Delivered
                    </button>
                  )}
                  {item.whatsappSentAt && <span style={{ fontSize: "10px", color: "#aaa" }}>WhatsApp sent ✓</span>}
                  {item.trackingNumber && <span style={{ fontSize: "10px", color: "#0A97EF", fontFamily: "monospace" }}>DTDC: {item.trackingNumber}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "white", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: "13px" }}>← Prev</button>
              <span style={{ padding: "8px 14px", fontSize: "13px", color: "#555" }}>Page {currentPage} of {pagination.totalPages}</span>
              <button disabled={currentPage === pagination.totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "white", cursor: currentPage === pagination.totalPages ? "not-allowed" : "pointer", fontSize: "13px" }}>Next →</button>
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default Prasadam
