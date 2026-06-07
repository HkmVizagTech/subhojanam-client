import { useState, useEffect } from "react"
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom"
import { 
  LayoutDashboard, 
  IndianRupee, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  RefreshCw,
  FileText,
  AlertCircle,
  PlusCircle,
  Package
} from "lucide-react"
import "../styles/AdminLayout.css"
import { apiBaseUrl } from "../../lib/apiConfig.js";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [adminUser, setAdminUser] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const user = localStorage.getItem("adminUser")
    if (user) {
      setAdminUser(JSON.parse(user))
    }
  }, [])

  const menuItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/transactions", icon: IndianRupee, label: "Transactions" },
    { path: "/admin/subscriptions", icon: RefreshCw, label: "Subscriptions" },
    { path: "/admin/missed-charges", icon: AlertCircle, label: "Missed Charges" },
    { path: "/admin/offline-donation", icon: PlusCircle, label: "Offline Donation" },
    { path: "/admin/prasadam", icon: Package, label: "Prasadam" },
    { path: "/admin/donors", icon: Users, label: "Donors" },
    { path: "/admin/receipts", icon: FileText, label: "Receipts" },
    { path: "/admin/campaigns", icon: FileText, label: "Campaigns" },
    { path: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { path: "/admin/utm-stats", icon: BarChart3, label: "UTM Analytics" },
    { path: "/admin/settings", icon: Settings, label: "Settings" },
  ]

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const handleLogout = async () => {
    try {
      await fetch(apiBaseUrl('/api/auth/logout'), {
        method: "POST",
        credentials: "include"
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminUser")
      
      navigate("/admin/login")
    }
  }

  return (
    <div className="admin-container">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Annadana Seva Admin</h2>
          <button 
            className="sidebar-toggle-mobile"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <X />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu />
          </button>

          <div className="header-right">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>
            <div className="admin-profile">
              <div className="profile-avatar">
                {adminUser?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="profile-info">
                <span className="profile-name">{adminUser?.name || 'Admin User'}</span>
                <span className="profile-role">{adminUser?.role === 'super-admin' ? 'Super Admin' : 'Administrator'}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
