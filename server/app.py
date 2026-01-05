from flask import Flask, request, jsonify
from flask_cors import CORS
import pyodbc
from textblob import TextBlob
from werkzeug.security import generate_password_hash, check_password_hash # Security Tools
import datetime

app = Flask(__name__)
CORS(app)

# --- DATABASE CONNECTION ---
def get_db_connection():
    try:
        conn = pyodbc.connect(
            "DRIVER={SQL Server};"
            "SERVER=Your_server_name;" 
            "DATABASE=VeriCheckDB;"
            "Trusted_Connection=yes;"
        )
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return None

# --- ROUTE 1: REGISTER ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({"error": "Missing fields"}), 400

    hashed_pw = generate_password_hash(password) # Encrypt the password

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            # Check if email exists
            cursor.execute("SELECT UserID FROM Users WHERE Email = ?", (email,))
            if cursor.fetchone():
                return jsonify({"error": "Email already registered"}), 409

            # Create User
            cursor.execute("INSERT INTO Users (FullName, Email, PasswordHash) VALUES (?, ?, ?)", 
                           (name, email, hashed_pw))
            conn.commit()
            conn.close()
            return jsonify({"message": "User created! Please log in."}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "DB Connection Failed"}), 500

# --- ROUTE 2: LOGIN ---
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT FullName, PasswordHash FROM Users WHERE Email = ?", (email,))
            user = cursor.fetchone()
            conn.close()

            if user and check_password_hash(user.PasswordHash, password):
                # Return the User's Name and Email to the Frontend
                return jsonify({"message": "Success", "name": user.FullName, "email": email}), 200
            else:
                return jsonify({"error": "Invalid credentials"}), 401
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "DB Connection Failed"}), 500

# --- ROUTE 3: ADVANCED ANALYZE FUNCTION ---
@app.route('/api/analyze', methods=['POST'])
def analyze_content():
    data = request.json
    content_type = data.get('type') 
    content_data = data.get('data')
    user_email = data.get('email')

    # 1. INITIALIZE VARIABLES
    base_score = 100
    breakdown = {"language": 100, "source": 50, "risk": 0} 
    flags = []
    source_type = "Unknown"
    explanation = "Analysis complete."

    # 2. RULE ENGINE
    suspicious_keywords = ['easy money', 'no experience', 'urgent', 'click here', 'whatsapp', 'lottery', 'investment', 'profit', 'bank account', 'password', 'verify', 'suspended']
    trusted_domains = ['bbc.com', 'reuters.com', 'nytimes.com', 'techcrunch.com', 'linkedin.com', 'google.com', 'microsoft.com', 'gov.in']

    # 3. LOGIC ENGINE
    if content_type == 'url':
        domain_match = any(domain in content_data.lower() for domain in trusted_domains)
        if domain_match:
            breakdown['source'] = 100
            source_type = "Trusted"
            explanation = "This URL belongs to a verified trusted organization."
        elif "http://" in content_data.lower():
            breakdown['source'] = 0
            base_score -= 40
            source_type = "Insecure (HTTP)"
            explanation = "This site uses an insecure connection (HTTP). Data is not encrypted."
        else:
            breakdown['source'] = 40
            source_type = "Unverified"
            base_score -= 10
            explanation = "This domain is not in our trusted whitelist. Proceed with caution."

    elif content_type in ['text', 'job']:
        found_flags = [word for word in suspicious_keywords if word in content_data.lower()]
        flags = found_flags 
        
        flag_count = len(found_flags)
        breakdown['risk'] = min(100, flag_count * 25) 
        base_score -= breakdown['risk']

        if flag_count > 0:
            explanation = f"Detected {flag_count} high-risk patterns ({', '.join(found_flags)}) often associated with scams."
        else:
            explanation = "No specific threat keywords were detected."

        if len(content_data) < 20:
            breakdown['language'] = 30
            base_score -= 10
            explanation += " Text is too short for deep analysis."

    # 4. FINALIZE SCORES
    final_score = max(0, min(100, base_score))
    verdict = "Safe"
    if final_score < 50: verdict = "High Risk"
    elif final_score < 75: verdict = "Suspicious"

    result = {
        "verdict": verdict,
        "score": final_score,
        "breakdown": breakdown,
        "flags": flags,
        "source_type": source_type,
        "explanation": explanation
    }

    # 6. SAVE TO DATABASE
    if user_email:
        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor()
                cursor.execute("SELECT UserID FROM Users WHERE Email = ?", (user_email,))
                row = cursor.fetchone()
                if row:
                    user_id = row.UserID
                    db_details = f"{explanation} | Flags: {', '.join(flags)}" if flags else explanation
                    cursor.execute("""
                        INSERT INTO Scans (UserID, ContentType, ContentSnippet, Verdict, TrustScore, Details, ScanDate)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (user_id, content_type, content_data[:500], result['verdict'], result['score'], db_details, datetime.datetime.now()))
                    conn.commit()
                    print(f"💾 Saved scan for {user_email}")
                conn.close()
            except Exception as e:
                print(f"❌ DB Error: {e}")

    return jsonify(result)

# --- ROUTE 4: HISTORY ---
@app.route('/api/history', methods=['POST'])
def get_history():
    data = request.json
    user_email = data.get('email')

    history = []
    conn = get_db_connection()
    if conn and user_email:
        try:
            cursor = conn.cursor()
            query = """
                SELECT TOP 10 s.ContentType, s.ContentSnippet, s.Verdict, s.TrustScore, s.ScanDate 
                FROM Scans s
                JOIN Users u ON s.UserID = u.UserID
                WHERE u.Email = ?
                ORDER BY s.ScanDate DESC
            """
            cursor.execute(query, (user_email,))
            rows = cursor.fetchall()
            for row in rows:
                history.append({
                    "type": row.ContentType,
                    "snippet": row.ContentSnippet,
                    "verdict": row.Verdict,
                    "score": row.TrustScore,
                    "date": row.ScanDate.strftime("%Y-%m-%d %H:%M")
                })
            conn.close()
        except Exception as e:
            print(f"❌ History Error: {e}")
    
    return jsonify(history)

# --- ROUTE 5: FORGOT PASSWORD (NEW!) ---
@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email is required"}), 400

    # The "Emergency" Password
    default_pw = "12345"
    hashed_pw = generate_password_hash(default_pw)

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            # 1. Check if user exists
            cursor.execute("SELECT UserID FROM Users WHERE Email = ?", (email,))
            if not cursor.fetchone():
                return jsonify({"error": "User not found"}), 404

            # 2. Force Update Password
            cursor.execute("UPDATE Users SET PasswordHash = ? WHERE Email = ?", (hashed_pw, email))
            conn.commit()
            conn.close()
            
            # 3. Success Message
            return jsonify({"message": f"Success! Your password has been reset to: {default_pw}"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "DB Connection Failed"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
