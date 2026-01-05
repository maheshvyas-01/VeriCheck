import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  ShieldCheck, LayoutDashboard, History, Bell, Settings as SettingsIcon, LogOut, 
  User, Database, Wifi, ShieldAlert 
} from 'lucide-react';

// Import Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';

// --- SIDEBAR COMPONENT ---
const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="brand">
        <ShieldCheck size={28} color="#3b82f6" />
        <span>VeriCheck</span>
      </div>

      <nav className="nav-menu">
        <Link to="/" style={{textDecoration:'none'}}>
          <div className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Threat Console
          </div>
        </Link>
        <Link to="/logs" style={{textDecoration:'none'}}>
          <div className={`nav-item ${isActive('/logs') ? 'active' : ''}`}>
            <History size={18} /> Audit Logs
          </div>
        </Link>
        <Link to="/settings" style={{textDecoration:'none'}}>
          <div className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
            <SettingsIcon size={18} /> Configuration
          </div>
        </Link>
      </nav>

      <div style={{marginTop: 'auto'}}>
        <div className="nav-item" onClick={onLogout} style={{color: '#ef4444', marginTop: '1rem', cursor:'pointer'}}>
          <LogOut size={18} /> Sign Out
        </div>
      </div>
    </aside>
  );
};

// --- MAIN APP COMPONENT ---
function App() {
  const [user, setUser] = useState(null); 
  const [history, setHistory] = useState([]);
  
  // STATE FOR DROPDOWNS
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const res = await axios.post('http://localhost:5000/api/history', { email: user.email });
      setHistory(res.data);
    } catch (err) { console.error("API Error"); }
  };

  useEffect(() => {
    if(user) fetchHistory();
  }, [user]);

  const handleLoginSuccess = (userData) => { setUser(userData); };

  const handleLogout = () => {
    setUser(null);
    setHistory([]);
    setShowProfile(false);
  };

  if (!user) return <Login onLogin={handleLoginSuccess} />;

  return (
    <Router>
      <div className="dashboard-container" onClick={() => {
        // Close menus if clicking anywhere else
        if(showNotifs) setShowNotifs(false);
        if(showProfile) setShowProfile(false);
      }}>
        <Sidebar onLogout={handleLogout} />

        <main className="main-content">
          
          <header className="page-header">
            <div className="page-title">
              <h1 style={{fontSize: '1.8rem', fontWeight: '700', letterSpacing: '-0.5px'}}>
                Threat Detection Console
              </h1>
              <p style={{color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px', display:'flex', alignItems:'center'}}>
                System Status: &nbsp; 
                <span style={{
                  width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', 
                  display: 'inline-block', marginRight: '6px', boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
                }}></span> 
                <span style={{color:'#10b981', fontWeight:'500'}}>Online</span>
              </p>
            </div>
            
            <div style={{display:'flex', gap:'20px', alignItems:'center', position:'relative'}}>
              
              {/* --- 1. NOTIFICATIONS BELL --- */}
              <div 
                style={{cursor: 'pointer', position:'relative'}} 
                onClick={(e) => { e.stopPropagation(); setShowNotifs(!showNotifs); setShowProfile(false); }}
              >
                <Bell size={22} color={showNotifs ? "white" : "#94a3b8"} />
                {/* Red Dot (Fake Notification Indicator) */}
                <div className="notification-dot"></div>
              </div>

              {/* NOTIFICATION DROPDOWN */}
              {showNotifs && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">System Alerts</div>
                  <div className="dropdown-item">
                     <Wifi size={16} color="#10b981"/> Database Connected
                  </div>
                  <div className="dropdown-item">
                     <Database size={16} color="#3b82f6"/> Backup completed (2h ago)
                  </div>
                  <div className="dropdown-item">
                     <ShieldAlert size={16} color="#f59e0b"/> New Security Patch Available
                  </div>
                </div>
              )}

              {/* --- 2. USER AVATAR (M) --- */}
              <div 
                 style={{cursor: 'pointer', position:'relative'}} 
                 onClick={(e) => { e.stopPropagation(); setShowProfile(!showProfile); setShowNotifs(false); }}
              >
                <div style={{
                  width:36, height:36, 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                  borderRadius:'50%', 
                  display:'flex', alignItems:'center', justifyContent:'center', 
                  fontWeight:'bold', color:'white',
                  boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* PROFILE DROPDOWN */}
              {showProfile && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div style={{color:'white'}}>{user.name}</div>
                    <div style={{fontSize:'0.8rem', color:'#94a3b8', fontWeight:'normal'}}>{user.email}</div>
                  </div>
                  
                  <Link to="/settings" style={{textDecoration:'none'}}>
                    <div className="dropdown-item"><SettingsIcon size={16}/> Account Settings</div>
                  </Link>
                  
                  <div className="dropdown-item" style={{color:'#ef4444', borderTop:'1px solid #334155'}} onClick={handleLogout}>
                    <LogOut size={16}/> Sign Out
                  </div>
                </div>
              )}

            </div>
          </header>

          <div style={{flex: 1, overflowY:'auto'}}>
            <Routes>
              <Route path="/" element={<Dashboard userEmail={user.email} refreshHistory={fetchHistory} history={history} />} />
              <Route path="/logs" element={<AuditLogs history={history} />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>

        </main>
      </div>
    </Router>
  );
}

export default App;