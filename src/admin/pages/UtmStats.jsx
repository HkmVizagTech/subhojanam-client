
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
      const [statsRes, campaignsRes, campaignStatsRes] = await Promise.all([
        adminAPI.getUtmStats(),
        adminAPI.getCampaigns(),
        adminAPI.getCampaignStats(),
      ]);
      setStats(statsRes.stats || []);
      setCampaigns(campaignsRes.data || []);
      setCampaignStats(campaignStatsRes.data || []);
    } catch (err) {
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    
  }, []);

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
              placeholder="Search UTM source..."
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
                {campaignStats.length === 0 ? (
                  <tr><td colSpan={6} className="utm-empty-row">No campaigns found</td></tr>
                ) : (
                  campaignStats.map(camp => (
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
                      <td>{camp.totalDon}</td>
                      <td>{String.fromCharCode(8377)}{camp.totalAmt.toLocaleString()}</td>
                      <td>
                        <button className="utm-analytics-link-btn" title="View analytics for this campaign" onClick={() => setSelectedCampaign(camp.utm?.campaign)}>
                          <ExternalLink size={15} style={{ marginRight: 4 }} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
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
                  <th>Donations</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredStats.length === 0 ? (
                  <tr><td colSpan={3} className="utm-empty-row">No data</td></tr>
                ) : (
                  filteredStats
                    .filter(row =>
                      search.trim()
                        ? (row._id?.source || "(none)")
                            .toLowerCase()
                            .includes(search.trim().toLowerCase())
                        : true
                    )
                    .map(row => (
                      <tr key={row._id ? row._id.campaign + row._id.source : "unknown"}>
                        <td className="utm-source-cell">
                          <Tag size={15} style={{ marginRight: 5, color: '#0A97EF' }} />
                          {row._id?.source || "(none)"}
                        </td>
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
    </div>
  );
}

export default UtmStats;
