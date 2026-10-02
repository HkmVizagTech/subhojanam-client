import { useState } from "react"
import { Search, Send, MessageCircle, Mail, CheckCircle2, AlertCircle } from "lucide-react"
import adminAPI from "../../services/adminApi"

const s = {
  page: { padding: "24px", maxWidth: "1000px" },
  input: { width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  btn: { border: "none", borderRadius: "10px", padding: "10px 18px", fontSize: "14px", fontWeight: "700", cursor: "pointer" },
  box: { background: "white", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "16px", marginBottom: "14px" },
}

const TYPE_STYLE = {
  monthly: { bg: "#ede9fe", fg: "#6d28d9", label: "Monthly" },
  "one-time": { bg: "#e0f2fe", fg: "#0369a1", label: "One-time" },
  offline: { bg: "#fef3c7", fg: "#92400e", label: "Offline" },
}

const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })

function DonorReceipts() {
  const [query, setQuery] = useState("")
  const [items, setItems] = useState(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState("")
  const [selected, setSelected] = useState({})

  const [viaWhatsapp, setViaWhatsapp] = useState(true)
  const [viaEmail, setViaEmail] = useState(false)
  const [altPhone, setAltPhone] = useState("")
  const [altEmail, setAltEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [outcome, setOutcome] = useState(null)

  const search = async () => {
    if (query.trim().length < 3) { setError("Enter at least 3 characters"); return }
    setSearching(true); setError(""); setOutcome(null); setSelected({})
    try {
      const res = await adminAPI.request("/api/admin/donor-receipts/search?search=" + encodeURIComponent(query.trim()))
      setItems(res.items || [])
    } catch (e) {
      setError(e.message || "Search failed"); setItems(null)
    } finally {
      setSearching(false)
    }
  }

  const sendable = (items || []).filter(i => i.canSend)
  const chosenIds = Object.keys(selected).filter(k => selected[k])
  const allSelected = sendable.length > 0 && chosenIds.length === sendable.length

  const toggleAll = () => {
    if (allSelected) setSelected({})
    else setSelected(Object.fromEntries(sendable.map(i => [i.id, true])))
  }

  const send = async () => {
    if (chosenIds.length === 0) { setError("Select at least one payment"); return }
    if (!viaWhatsapp && !viaEmail) { setError("Choose WhatsApp, email, or both"); return }
    setSending(true); setError(""); setOutcome(null)
    try {
      const res = await adminAPI.request("/api/admin/donor-receipts/send", {
        method: "POST",
        body: JSON.stringify({ donationIds: chosenIds, whatsapp: viaWhatsapp, email: viaEmail, phone: altPhone, toEmail: altEmail }),
      })
      setOutcome(res)
    } catch (e) {
      setError(e.message || "Send failed")
    } finally {
      setSending(false)
    }
  }

  const nameById = Object.fromEntries((items || []).map(i => [i.id, i]))

  return (
    <div style={s.page}>
      <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 4px", display: "flex", alignItems: "center", gap: "10px" }}>
        <Send size={22} color="#0A97EF" /> Send Receipts
      </h1>
      <p style={{ color: "#888", fontSize: "14px", marginBottom: "18px" }}>
        Re-send receipts that were already issued — for any donor, including each month of a monthly donor. Send to their number on record, a corrected number, and/or email.
      </p>

      <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "#aaa" }} />
          <input style={{ ...s.input, paddingLeft: "36px" }} placeholder="Donor name, mobile, email or subscription ID (sub_...)"
            value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} />
        </div>
        <button onClick={search} disabled={searching} style={{ ...s.btn, background: "#0A97EF", color: "white" }}>
          {searching ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <div style={{ padding: "10px 12px", borderRadius: "10px", marginBottom: "12px", fontSize: "13px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5" }}>❌ {error}</div>}

      {items && items.length === 0 && <p style={{ color: "#888" }}>No paid donations found for that search.</p>}

      {items && items.length > 0 && (
        <>
          <div style={s.box}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
              <label style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", fontWeight: 600 }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} disabled={sendable.length === 0} />
                Select all with a receipt ({sendable.length})
              </label>
              <span style={{ fontSize: "13px", color: "#888" }}>{items.length} payment(s) · {chosenIds.length} selected</span>
            </div>

            {items.map((it) => {
              const t = TYPE_STYLE[it.type] || TYPE_STYLE["one-time"]
              return (
                <label key={it.id} style={{ display: "flex", gap: "12px", alignItems: "center", padding: "10px 0", borderTop: "1px solid #f1f1f1", opacity: it.canSend ? 1 : 0.55, cursor: it.canSend ? "pointer" : "not-allowed" }}>
                  <input type="checkbox" disabled={!it.canSend} checked={!!selected[it.id]}
                    onChange={(e) => setSelected({ ...selected, [it.id]: e.target.checked })} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600 }}>
                      {it.name} · ₹{it.amount} <span style={{ fontWeight: 400, color: "#888" }}>· {fmtDate(it.date)}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#888", fontFamily: "monospace" }}>
                      {it.mobile}{it.email ? " · " + it.email : ""}
                    </div>
                    <div style={{ fontSize: "12px", color: it.canSend ? "#166534" : "#b45309" }}>
                      {it.canSend ? "Receipt " + it.receiptNumber : "No receipt issued yet — create it from Missed Charges"}
                    </div>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px", background: t.bg, color: t.fg }}>{t.label}</span>
                </label>
              )
            })}
          </div>

          <div style={s.box}>
            <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "10px" }}>Send via</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                  <input type="checkbox" checked={viaWhatsapp} onChange={(e) => setViaWhatsapp(e.target.checked)} />
                  <MessageCircle size={14} color="#16a34a" /> WhatsApp
                </label>
                <input style={s.input} placeholder="Different number? (10 digits, optional)" value={altPhone} onChange={(e) => setAltPhone(e.target.value)} disabled={!viaWhatsapp} />
                <div style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}>Leave blank to use each donor's number on record.</div>
              </div>
              <div>
                <label style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                  <input type="checkbox" checked={viaEmail} onChange={(e) => setViaEmail(e.target.checked)} />
                  <Mail size={14} color="#0A97EF" /> Email (PDF attached)
                </label>
                <input style={s.input} placeholder="Different email? (optional)" value={altEmail} onChange={(e) => setAltEmail(e.target.value)} disabled={!viaEmail} />
                <div style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}>Leave blank to use the email on each donation.</div>
              </div>
            </div>

            <button onClick={send} disabled={sending || chosenIds.length === 0}
              style={{ ...s.btn, marginTop: "14px", width: "100%", background: sending || chosenIds.length === 0 ? "#9ca3af" : "#16a34a", color: "white" }}>
              {sending ? "Sending..." : "Send " + chosenIds.length + " receipt" + (chosenIds.length === 1 ? "" : "s")}
            </button>
          </div>
        </>
      )}

      {outcome && (
        <div style={s.box}>
          <div style={{ fontWeight: 700, marginBottom: "8px" }}>{outcome.message}</div>
          {outcome.results.map((r) => {
            const it = nameById[r.id]
            const ok = r.whatsappSentTo || r.emailSentTo
            return (
              <div key={r.id} style={{ display: "flex", gap: "8px", alignItems: "flex-start", padding: "6px 0", borderTop: "1px solid #f1f1f1", fontSize: "13px" }}>
                {ok && !r.error ? <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} /> : <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />}
                <div>
                  <div style={{ fontWeight: 600 }}>{r.name || it?.name} · ₹{r.amount ?? it?.amount} {it ? <span style={{ fontWeight: 400, color: "#888" }}>({fmtDate(it.date)})</span> : null}</div>
                  {r.whatsappSentTo && <div style={{ color: "#166534" }}>WhatsApp sent to {r.whatsappSentTo}</div>}
                  {r.emailSentTo && <div style={{ color: "#166534" }}>Email sent to {r.emailSentTo}</div>}
                  {r.whatsappError && <div style={{ color: "#991b1b" }}>WhatsApp failed: {r.whatsappError}</div>}
                  {r.emailError && <div style={{ color: "#991b1b" }}>Email failed: {r.emailError}</div>}
                  {r.error && <div style={{ color: "#991b1b" }}>{r.error}</div>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DonorReceipts
