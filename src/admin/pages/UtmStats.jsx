import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, IndianRupee, Search, Tag, PlusCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import adminAPI from "../../services/adminApi";
import "../styles/UtmStats.css";

function getCampaignName(campaignId, campaigns) {
  const found = campaigns.find(c => c.utm?.campaign === campaignId);
  return found ? found.name : campaignId || "(none)";
}



function UtmStats() {

  const [stats, setStats] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [campaignStats, setCampaignStats] = useState([]);
  const [campaignTxns, setCampaignTxns] = useState([]);
  const [campaignTxnsLoading, setCampaignTxnsLoading] = useState(false);
  const [campaignTxnsModal, setCampaignTxnsModal] = useState(null); // { campaign, source, medium }

  const handleViewCampaign = async (camp) => {
    setCampaignTxnsModal(camp);
    setCampaignTxns([]);
    setCampaignTxnsLoading(true);
    try {
      const params = new URLSearchParams();
      if (camp._id?.campaign) params.set("campaign", camp._id.campaign);
      if (camp._id?.source) params.set("source", camp._id.source);
      if (camp._id?.medium) params.set("medium", camp._id.medium);
      const res = await adminAPI.request(`/api/admin/utm-transactions?${params.toString()}`);
      setCampaignTxns(res.transactions || []);
    } catch (err) {
      console.error("Failed to fetch campaign transactions:", err);
    } finally {
      setCampaignTxnsLoading(false);
    }
  };

  const navigate = useNavigate();


  const campaignOptions = campaigns.map(c => c.utm?.campaign).filter(Boolean);
  const filteredStats = stats.filter(row =>
    selectedCampaign ? row._id?.campaign === selectedCampaign : true
  );
  const totalDonations = filteredStats.reduce((sum, row) => sum + row.count, 0);
  const totalAmount = filteredStats.reduce((sum, row) => sum + row.totalAmount, 0);
  const topSource = filteredStats.length > 0 ?
    filteredStats.reduce((a, b) => (a.totalAmount > b.totalAmount ? a : b))._id?.source || "(none)"
    : "(none)";
  const topCampaigns = Object.values(
    stats.reduce((acc, row) => {
      const camp = row._id?.campaign || "(none)";
      if (!acc[camp]) acc[camp] = { camp, amount: 0 };
      acc[camp].amount += row.totalAmount;
      return acc;
    }, {})
  ).sort((a, b) => b.amount - a.amount).slice(0, 5);

  async function fetchAll() {
    setLoading(true);
    setError("");
    try {
      const statsRes = await adminAPI.getUtmStats();
      setStats(statsRes.stats || []);
      
      const campaignsRes = await adminAPI.getCampaigns();
      setCampaigns(campaignsRes.campaigns || []);
    } catch (err) {
      setError("Failed to load analytics data");
      console.error('[DEBUG] Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    
  }, []);


  const sourceBreakdownStats = selectedCampaign ? filteredStats : stats;

  return (
    <div className="utm-stats-root">
      <div className="utm-stats-page">
        <div className="utm-header">
          <div>
            <h1>UTM Analytics</h1>
            <p>Track donation performance by campaign and UTM source for marketing insights</p>
          </div>
          <div className="utm-search-bar">
            <label htmlFor="campaign-select" className="utm-campaign-label">Campaign:</label>
            <select
              id="campaign-select"
              className="utm-campaign-select"
              value={selectedCampaign}
              onChange={e => setSelectedCampaign(e.target.value)}
            >
              <option value="">All</option>
              {campaignOptions.map(campId => (
                <option key={campId} value={campId}>
                  {getCampaignName(campId, campaigns)}
                </option>
              ))}
            </select>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search source, medium, campaign..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="utm-source-search"
            />
          </div>
        </div>


      
        <div className="utm-summary-cards">
          <div className="utm-card">
            <div className="utm-card-icon" style={{ background: '#e3f2fd' }}>
              <BarChart3 size={24} style={{ color: '#0A97EF' }} />
            </div>
            <div>
              <p>Total Sources</p>
              <h3>{filteredStats.length}</h3>
            </div>
          </div>
          <div className="utm-card">
            <div className="utm-card-icon" style={{ background: '#d1fae5' }}>
              <Users size={24} style={{ color: '#10b981' }} />
            </div>
            <div>
              <p>Total Donations</p>
              <h3>{totalDonations}</h3>
            </div>
          </div>
          <div className="utm-card">
            <div className="utm-card-icon" style={{ background: '#fef3c7' }}>
              <IndianRupee size={24} style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <p>Total Amount</p>
              <h3>{String.fromCharCode(8377)}{totalAmount.toLocaleString()}</h3>
            </div>
          </div>
          <div className="utm-card">
            <div className="utm-card-icon" style={{ background: '#ede9fe' }}>
              <TrendingUp size={24} style={{ color: '#7c3aed' }} />
            </div>
            <div>
              <p>Top Source</p>
              <h3>{topSource}</h3>
            </div>
          </div>
        </div>

        
        <div className="utm-campaigns-overview-section">
          <div className="utm-campaigns-overview-header">
            <h2>Campaigns Overview</h2>
            <button className="utm-create-campaign-btn" onClick={() => navigate('/admin/campaigns')} title="Create or manage campaigns">
              <PlusCircle size={18} style={{ marginRight: 6 }} /> Create/Manage Campaigns
            </button>
          </div>
          <div className="utm-campaigns-overview-table-wrapper">
            <table className="utm-campaigns-overview-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Total Donations</th>
                  <th>Total Amount</th>
                  <th>Analytics</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr><td colSpan={6} className="utm-empty-row">No campaigns found</td></tr>
                ) : (
                  campaigns.map(camp => {
                   
                    const stat = stats.find(s => s._id?.campaign === camp.utm?.campaign);
                    return (
                      <tr key={camp._id}>
                        <td className="utm-camp-name-cell">
                          <Tag size={15} style={{ marginRight: 5, color: '#0A97EF' }} />
                          {camp.name}
                        </td>
                        <td>{camp.utm?.campaign}</td>
                        <td>
                          <span className={camp.isActive ? "status-active-badge" : "status-inactive-badge"} title={camp.isActive ? "Active" : "Inactive"}>
                            {camp.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>{stat ? stat.count : 0}</td>
                        <td>{String.fromCharCode(8377)}{stat ? stat.totalAmount.toLocaleString() : '0'}</td>
                        <td>
                          <button className="utm-analytics-link-btn" title="View transactions for this campaign" onClick={() => handleViewCampaign(camp)}>
                            <ExternalLink size={15} style={{ marginRight: 4 }} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="utm-bar-chart-section">
          <h2>Top Campaigns by Amount</h2>
          <div className="utm-bar-chart">
            {topCampaigns.length === 0 ? (
              <div className="utm-bar-chart-empty">No campaign data</div>
            ) : (
              topCampaigns.map((c, i) => {
                const width = Math.max(10, (c.amount / (topCampaigns[0]?.amount || 1)) * 100) + '%';
                return (
                  <div className="utm-bar-chart-bar" key={c.camp}>
                    <div className="utm-bar-chart-label">
                      <Tag size={16} style={{ marginRight: 6, color: '#0A97EF' }} />
                      {getCampaignName(c.camp, campaigns)}
                    </div>
                    <div className="utm-bar-outer">
                      <div
                        className="utm-bar-inner"
                        style={{ width }}
                      >
                        {String.fromCharCode(8377)}{c.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="utm-table-section">
          <h2>Source Breakdown</h2>
          {loading ? (
            <div className="utm-loading">Loading...</div>
          ) : error ? (
            <div className="utm-error">{error}</div>
          ) : (
            <table className="utm-stats-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Medium</th>
                  <th>Campaign</th>
                  <th>Donations</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {sourceBreakdownStats.filter(row =>
                  search.trim()
                    ? (row._id?.source || "(none)")
                        .toLowerCase()
                        .includes(search.trim().toLowerCase()) ||
                      (row._id?.campaign || "")
                        .toLowerCase()
                        .includes(search.trim().toLowerCase()) ||
                      (row._id?.medium || "")
                        .toLowerCase()
                        .includes(search.trim().toLowerCase())
                    : true
                ).length === 0 ? (
                  <tr><td colSpan={5} className="utm-empty-row">No data</td></tr>
                ) : (
                  sourceBreakdownStats.filter(row =>
                    search.trim()
                      ? (row._id?.source || "(none)")
                          .toLowerCase()
                          .includes(search.trim().toLowerCase()) ||
                        (row._id?.campaign || "")
                          .toLowerCase()
                          .includes(search.trim().toLowerCase()) ||
                        (row._id?.medium || "")
                          .toLowerCase()
                          .includes(search.trim().toLowerCase())
                      : true
                  ).map(row => (
                    <tr key={row._id ? row._id.campaign + row._id.source + row._id.medium : "unknown"}>
                      <td className="utm-source-cell">
                        <Tag size={15} style={{ marginRight: 5, color: '#0A97EF' }} />
                        {row._id?.source || "direct"}
                      </td>
                      <td>{row._id?.medium || "none"}</td>
                      <td>{row._id?.campaign && row._id.campaign !== "direct" ? row._id.campaign : "—"}</td>
                      <td>{row.count}</td>
                      <td>{String.fromCharCode(8377)}{row.totalAmount.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Campaign Transactions Modal */}
      {campaignTxnsModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "16px", width: "100%", maxWidth: "700px", maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>
                  {campaignTxnsModal._id?.campaign || "Direct"} — Transactions
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>
                  Source: {campaignTxnsModal._id?.source || "direct"} · Medium: {campaignTxnsModal._id?.medium || "none"}
                </p>
              </div>
              <button onClick={() => setCampaignTxnsModal(null)} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#888" }}>✕</button>
            </div>
            <div style={{ overflowY: "auto", padding: "16px 24px", flex: 1 }}>
              {campaignTxnsLoading ? (
                <p style={{ textAlign: "center", color: "#888", padding: "40px 0" }}>Loading...</p>
              ) : campaignTxns.length === 0 ? (
                <p style={{ textAlign: "center", color: "#888", padding: "40px 0" }}>No transactions found.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                      <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: "600", color: "#555" }}>Donor</th>
                      <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: "600", color: "#555" }}>Mobile</th>
                      <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: "600", color: "#555" }}>Amount</th>
                      <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: "600", color: "#555" }}>Date</th>
                      <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: "600", color: "#555" }}>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignTxns.map((txn, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ fontWeight: "600", color: "#1a1a2e" }}>{txn.name}</div>
                          <div style={{ color: "#aaa", fontSize: "11px" }}>{txn.email}</div>
                        </td>
                        <td style={{ padding: "10px 12px", color: "#555" }}>{txn.mobile}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "700", color: "#0A97EF" }}>₹{txn.amount?.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "10px 12px", color: "#888" }}>{new Date(txn.createdAt).toLocaleDateString("en-IN")}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ background: txn.isRecurring ? "#eff6ff" : "#f0fdf4", color: txn.isRecurring ? "#1d4ed8" : "#15803d", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "600" }}>
                            {txn.isRecurring ? "Monthly" : "One-time"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div style={{ padding: "12px 24px", borderTop: "1px solid #e5e7eb", fontSize: "13px", color: "#888" }}>
              {campaignTxns.length} transaction{campaignTxns.length !== 1 ? "s" : ""} · Total: ₹{campaignTxns.reduce((s, t) => s + (t.amount || 0), 0).toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UtmStats;
