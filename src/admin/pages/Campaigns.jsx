
import { useEffect, useState } from "react";
import { Copy, PlusCircle, CheckCircle, Search, Trash2 } from "lucide-react";
import adminAPI from "../../services/adminApi";
import "../styles/Campaigns.css";



function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: "",
    source: "",
    medium: "",
    campaign: "",
    content: "",
    term: ""
  });
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState("");
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCampaigns();
    // eslint-disable-next-line
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getCampaigns();
      setCampaigns(res.campaigns || []);
      setError(null);
    } catch (err) {
      setError("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async e => {
    e.preventDefault();
    setCreating(true);
    setSuccess("");
    setError(null);
    try {
      await adminAPI.createCampaign(form);
      setSuccess("Campaign created!");
      setForm({ name: "", source: "", medium: "", campaign: "", content: "", term: "" });
      fetchCampaigns();
      setToast("Campaign created!");
      setTimeout(() => setToast(""), 2000);
    } catch (err) {
      setError(err.message || "Failed to create campaign");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = url => {
    navigator.clipboard.writeText(url);
    setToast("Copied!");
    setTimeout(() => setToast(""), 1500);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await adminAPI.deleteCampaign(id);
      setToast("Campaign deleted!");
      fetchCampaigns();
      setTimeout(() => setToast(""), 1500);
    } catch (err) {
      setError(err.message || "Failed to delete campaign");
    }
  };

  const filteredCampaigns = campaigns.filter(c =>
    search.trim()
      ? c.name.toLowerCase().includes(search.trim().toLowerCase()) ||
        (c.utm?.campaign || "").toLowerCase().includes(search.trim().toLowerCase())
      : true
  );

  return (
    <div className="campaigns-page">
      {toast && <div className="toast-msg">{toast}</div>}
      <form className="campaigns-form" onSubmit={handleCreate} autoComplete="off">
        <h2 className="card-title">Create Campaign</h2>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Campaign Name (e.g. Sankranthi 2026)" required title="A friendly name for your campaign" />
        <input name="source" value={form.source} onChange={handleChange} placeholder="Source (e.g. facebook)" required title="Where the traffic comes from (e.g. facebook, google)" />
        <input name="medium" value={form.medium} onChange={handleChange} placeholder="Medium (e.g. social)" title="Marketing medium (e.g. social, email)" />
        <input name="campaign" value={form.campaign} onChange={handleChange} placeholder="Campaign Slug (e.g. sankranthi_2026)" required title="Unique slug for this campaign" />
        <input name="content" value={form.content} onChange={handleChange} placeholder="Content (optional)" title="Ad content (optional)" />
        <input name="term" value={form.term} onChange={handleChange} placeholder="Term (optional)" title="Paid keywords (optional)" />
        <button type="submit" className="create-btn" disabled={creating}>
          <PlusCircle size={18} /> Create
        </button>
        {success && <div className="success-msg">{success}</div>}
        {error && <div className="error-msg">{error}</div>}
      </form>
      <div className="campaigns-list-card">
        <div className="campaigns-list-header">
          <h2 className="card-title">All Campaigns</h2>
          <div className="campaigns-search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="no-data">No campaigns found</div>
        ) : (
          <div className="table-wrapper">
            <table className="campaigns-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>UTM Campaign</th>
                  <th>URL</th>
                  <th>Status</th>
                  <th>Copy</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map(c => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.utm?.campaign}</td>
                    <td className="url-cell">
                      <a href={c.generatedUrl} target="_blank" rel="noopener noreferrer">{c.generatedUrl}</a>
                    </td>
                    <td>
                      <span className={c.isActive ? "status-active-badge" : "status-inactive-badge"} title={c.isActive ? "Active" : "Inactive"}>
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button className="copy-btn" onClick={() => handleCopy(c.generatedUrl)} title="Copy URL">
                        <Copy size={16} />
                      </button>
                    </td>
                    <td>
                      <button className="copy-btn" style={{color:'#ef4444'}} onClick={() => handleDelete(c._id)} title="Delete Campaign">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Campaigns;
