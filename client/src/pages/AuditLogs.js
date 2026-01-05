import React, { useState } from 'react'; // 1. Imported useState
import { History, Search, FileText, Globe, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const AuditLogs = ({ history }) => {
  // 2. Add State for the Search Term
  const [searchTerm, setSearchTerm] = useState('');

  // 3. Create the Filter Logic
  const filteredHistory = history ? history.filter(item => {
    const term = searchTerm.toLowerCase();
    // Search in Type, Verdict, or Content Snippet
    return (
      item.type.toLowerCase().includes(term) ||
      item.verdict.toLowerCase().includes(term) ||
      (item.snippet && item.snippet.toLowerCase().includes(term))
    );
  }) : [];

  return (
    <div style={{animation: 'fadeIn 0.5s ease', paddingBottom: '2rem'}}>
      
      {/* HEADER SECTION */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem'}}>
        <h2 style={{marginTop: 0, display:'flex', alignItems:'center', gap:'10px', fontSize: '1.5rem'}}>
          <History size={28} color="#3b82f6"/> Scan Audit Logs
        </h2>
        
        {/* WORKING SEARCH BAR */}
        <div style={{
          background: '#1e293b', 
          display:'flex', alignItems:'center', 
          padding:'10px 16px', borderRadius:'8px', 
          border: '1px solid #334155', width: '300px'
        }}>
           <Search size={18} color="#94a3b8" style={{marginRight:'10px'}}/>
           <input 
             type="text" 
             placeholder="Search logs (e.g., 'High Risk')..." 
             value={searchTerm} // Connected to State
             onChange={(e) => setSearchTerm(e.target.value)} // Updates State
             style={{background:'transparent', border:'none', color:'white', outline:'none', width: '100%'}}
           />
        </div>
      </div>

      {/* DATA TABLE */}
      <div style={{background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.2)'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{background: '#0f172a', textAlign: 'left', color: '#94a3b8', fontSize: '0.9rem', borderBottom: '1px solid #334155'}}>
              <th style={{padding: '16px'}}>Timestamp</th>
              <th style={{padding: '16px'}}>Scan Type</th>
              <th style={{padding: '16px'}}>Content Snippet</th>
              <th style={{padding: '16px'}}>Trust Score</th>
              <th style={{padding: '16px'}}>Verdict</th>
            </tr>
          </thead>
          <tbody>
            {/* 4. Map over FILTERED HISTORY instead of raw history */}
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item, index) => (
                <tr key={index} style={{borderBottom: '1px solid #334155', transition: 'background 0.2s'}}>
                  
                  {/* Date */}
                  <td style={{padding: '16px', color: '#cbd5e1', fontSize: '0.9rem'}}>
                    {item.date}
                  </td>
                  
                  {/* Type (with Icon) */}
                  <td style={{padding: '16px'}}>
                     <span style={{
                       display:'inline-flex', alignItems:'center', gap:'8px', 
                       textTransform:'capitalize', padding: '4px 10px', 
                       background: '#334155', borderRadius: '6px', fontSize: '0.85rem'
                     }}>
                       {item.type === 'url' ? <Globe size={14} color="#3b82f6"/> : item.type === 'job' ? <Info size={14} color="#f59e0b"/> : <FileText size={14} color="#a855f7"/>} 
                       {item.type}
                     </span>
                  </td>
                  
                  {/* Snippet */}
                  <td style={{padding: '16px', color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.9rem'}}>
                    {item.snippet ? item.snippet.substring(0, 50) + (item.snippet.length > 50 ? '...' : '') : '-'}
                  </td>
                  
                  {/* Score */}
                  <td style={{padding: '16px', fontWeight:'bold', color: item.score > 70 ? '#10b981' : '#ef4444'}}>
                    {item.score}/100
                  </td>
                  
                  {/* Verdict Badge */}
                  <td style={{padding: '16px'}}>
                    <span style={{
                      padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight:'600',
                      background: item.score > 70 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: item.score > 70 ? '#10b981' : '#ef4444',
                      border: `1px solid ${item.score > 70 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      display: 'inline-flex', alignItems: 'center', gap: '6px'
                    }}>
                      {item.score > 70 ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>} {item.verdict}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              // EMPTY STATE
              <tr>
                <td colSpan="5" style={{padding:'3rem', textAlign:'center', color:'#64748b'}}>
                  <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'10px'}}>
                    <History size={40} color="#334155"/>
                    <p>No results found matching "{searchTerm}"</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;