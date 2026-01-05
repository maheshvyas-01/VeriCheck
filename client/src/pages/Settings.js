import React, { useState } from 'react';

function Settings() {
  // 1. State management for inputs
  const [apiKey, setApiKey] = useState('sk_live_51M...');
  const [sensitivity, setSensitivity] = useState(70);
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 2. Handle Save Action
  const handleSave = () => {
    setIsSaving(true);
    // Simulate an API call
    setTimeout(() => {
      setIsSaving(false);
      alert(`Settings Saved!\nAPI Key: ${apiKey}\nSensitivity: ${sensitivity}`);
    }, 800);
  };

  // 3. Handle Reset Action
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset to defaults?")) {
      setApiKey('sk_live_51M...'); // Or clear it: ''
      setSensitivity(70);
    }
  };

  return (
    <div className="analysis-panel">
      <h2 style={{ marginTop: 0 }}>System Configuration</h2>
      <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
        Manage your API keys and analysis sensitivity thresholds.
      </p>

      {/* API Key Section */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>
          API Key
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API Key"
            style={{
              width: '100%',
              padding: '10px',
              paddingRight: '60px', // Space for the toggle button
              background: '#0f172a',
              border: '1px solid #334155',
              color: '#fff', // Changed from generic gray to white for readability
              borderRadius: '6px',
              outline: 'none'
            }}
          />
          <button
            onClick={() => setShowKey(!showKey)}
            style={{
              position: 'absolute',
              right: '10px',
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            {showKey ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* Sensitivity Threshold Section */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label style={{ color: '#cbd5e1' }}>Sensitivity Threshold</label>
          <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{sensitivity}%</span>
        </div>
        
        <input
          type="range"
          min="0"
          max="100"
          value={sensitivity}
          onChange={(e) => setSensitivity(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer' }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginTop: '5px' }}>
          <span>Strict (0)</span>
          <span>Balanced (50)</span>
          <span>Permissive (100)</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          className="primary-btn" 
          onClick={handleSave}
          disabled={isSaving}
          style={{ opacity: isSaving ? 0.7 : 1 }}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        
        <button 
          onClick={handleReset}
          style={{
            background: 'transparent',
            border: '1px solid #334155',
            color: '#cbd5e1',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#1e293b'}
          onMouseOut={(e) => e.target.style.background = 'transparent'}
        >
          Reset Defaults
        </button>
      </div>
    </div>
  );
}

export default Settings;