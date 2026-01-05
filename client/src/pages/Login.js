import React, { useState } from 'react';
import axios from 'axios';
// 1. IMPORT SHIELDCHECK HERE
import { ArrowRight, Lock, Mail, User, AlertCircle, ShieldCheck } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegistering ? '/api/register' : '/api/login';
    
    try {
      const res = await axios.post(`http://localhost:5000${endpoint}`, formData);
      if (isRegistering) {
        alert("Registration Successful! Please Log In.");
        setIsRegistering(false);
      } else {
        onLogin({ name: res.data.name, email: res.data.email });
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLE FORGOT PASSWORD ---
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const email = prompt("Please enter your registered email address:");
    if (!email) return;

    try {
      const res = await axios.post('http://localhost:5000/api/forgot-password', { email });
      alert(res.data.message); 
    } catch (err) {
      alert("Error: That email is not registered in our system.");
    }
  };

  return (
    <div style={{display: 'flex', height: '100vh', backgroundColor: '#0f172a', color: 'white'}}>
      
      {/* LEFT SIDE: Branding Panel */}
      <div style={{flex: 1, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', borderRight: '1px solid #334155'}}>
        <div style={{marginBottom: '2rem'}}>
             {/* 2. REPLACED LOGO WITH SHIELDCHECK */}
             <div style={{width: 80, height: 80, background: '#3b82f6', borderRadius: '50%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <ShieldCheck size={40} color="white" />
             </div>
        </div>
        <h1 style={{fontSize: '3rem', margin: '0 0 1rem 0', color: 'white'}}>VeriCheck</h1>
        <p style={{fontSize: '1.4rem', fontWeight: '500', color: '#e2e8f0', lineHeight: '1.4', maxWidth: '500px'}}>
          "Verify the Unverified."
        </p>
        <p style={{fontSize: '1.1rem', color: '#94a3b8', marginTop:'1rem', maxWidth: '500px'}}>
          Real-time threat detection powered by next-gen neural networks.
        </p>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'}}>
        <div style={{width: '100%', maxWidth: '400px'}}>
          
          <div style={{marginBottom: '2rem'}}>
            <h2 style={{fontSize: '2rem', margin: '0 0 10px 0'}}>
              {isRegistering ? "Create Account" : "Welcome Back"}
            </h2>
            <p style={{color: '#64748b'}}>
              {isRegistering ? "Start securing your digital workspace." : "Please enter your credentials."}
            </p>
          </div>

          {error && (
            <div style={{background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '10px', alignItems: 'center'}}>
              <AlertCircle size={20} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <div className="input-group">
                <User className="input-icon" size={20} />
                <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
              </div>
            )}
            
            <div className="input-group">
              <Mail className="input-icon" size={20} />
              <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            </div>

            {/* FORGOT PASSWORD LINK */}
            {!isRegistering && (
                <div style={{textAlign: 'right', marginBottom: '1.5rem'}}>
                    <a href="#" onClick={handleForgotPassword} style={{color: '#3b82f6', textDecoration: 'none', fontSize: '0.9rem', cursor:'pointer'}}>
                        Forgot Password?
                    </a>
                </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Sign In')} <ArrowRight size={20} />
            </button>
          </form>

          <div style={{marginTop: '2rem', textAlign: 'center', color: '#94a3b8'}}>
            {isRegistering ? "Already have an account? " : "Don't have an account? "}
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              style={{background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold'}}
            >
              {isRegistering ? "Sign In" : "Register Now"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;