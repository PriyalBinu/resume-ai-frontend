import React, { useState } from "react";
import { useAuth } from "react-oidc-context";
import "./App.css";

function App() {
  const auth = useAuth();

  // Resume recommender states
  const [resumeText, setResumeText] = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  // Chatbot states
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  // Job alert subscription states
  const [subEmail, setSubEmail] = useState("");
  const [subSkills, setSubSkills] = useState([]);

  // ---------- Backend endpoints (Edit if needed) ----------
  // Recommendation backend (keep the value your project expects)
 const API_BASE = "https://tdf4ro427fv6iba7hmotncz62u0xfpnb.lambda-url.eu-north-1.on.aws";
 const SNS_API = "https://tdf4ro427fv6iba7hmotncz62u0xfpnb.lambda-url.eu-north-1.on.aws";


  // =======================================================
  // Get Job Recommendation
  // =======================================================
  const handleRecommend = async () => {
    if (!resumeText.trim()) {
      alert("Please paste your resume first!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/recommend`, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resumeText }),
      });

      if (!response.ok) {
        const txt = await response.text().catch(() => "");
        throw new Error(`Recommendation API error: ${response.status} ${txt}`);
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error("Recommend error:", error);
      alert("Backend error: Could not get recommendations.");
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // Subscribe to Job Alerts (SNS)
  // =======================================================
  const subscribeToAlerts = async () => {
    if (!subEmail) {
      alert("Please enter your email!");
      return;
    }
    if (!subSkills || subSkills.length === 0) {
      alert("Please select at least one skill!");
      return;
    }

    try {
      const res = await fetch(`${SNS_API}/api/subscribe`, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail, skills: subSkills }),
      });

      // handle non-OK
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Subscribe API error ${res.status}: ${txt}`);
      }

      const data = await res.json();
      alert(data.message || "Confirmation email sent! Please check your inbox.");
    } catch (err) {
      console.error("Subscribe error:", err);
      alert("Could not subscribe. Check backend.");
    }
  };

  // =======================================================
  // ChatGPT Chatbot Function
  // =======================================================
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput("");
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: userMsg }],
        }),
      });

      if (!response.ok) {
        const t = await response.text().catch(() => "");
        throw new Error(`OpenAI error ${response.status}: ${t}`);
      }

      const data = await response.json();
      const botReply = data?.choices?.[0]?.message?.content || "No response.";
      setChatMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (err) {
      console.error("Chat error:", err);
      setChatMessages((prev) => [...prev, { sender: "bot", text: "ChatGPT API error." }]);
    }
  };

  // =======================================================
  // Authentication UI handling
  // =======================================================
  if (auth.isLoading) return <div className="loading">Loading...</div>;
  if (auth.error) return <div className="error">Error: {auth.error.message}</div>;

  // =======================================================
  // Authenticated UI
  // =======================================================
  if (auth.isAuthenticated) {
    return (
      <div className="app-container">
        <header>
          <h2>AI Resume Job Recommender</h2>
          <p>
            Welcome, <b>{auth.user?.profile?.email}</b>
          </p>
          <button className="signout-btn" onClick={() => auth.removeUser()}>
            Sign out
          </button>
        </header>

        {/* Resume input + recommendation */}
        <div className="content">
          <h3>Paste your resume text below:</h3>

          <textarea
            className="resume-box"
            rows="10"
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          ></textarea>

          <button className="recommend-btn" onClick={handleRecommend} disabled={loading}>
            {loading ? "Analyzing..." : "Get AI Recommendations"}
          </button>

          {recommendations && (
            <div className="results">
              <h4>AI Recommendation Summary</h4>
              <p>
                <b>Recommended Jobs:</b>{" "}
                {(recommendations.recommended_jobs || []).join(", ")}
              </p>
              {recommendations.insights && (
                <p>
                  <b>AI Insights:</b> {recommendations.insights}
                </p>
              )}
            </div>
          )}
        </div>

        {/* SNS subscription */}
        <div className="alert-subscribe-box">
          <h3>Get Job Alerts by Email</h3>

          <input
            type="email"
            placeholder="Enter your email"
            value={subEmail}
            onChange={(e) => setSubEmail(e.target.value)}
          />

          <select
            multiple
            value={subSkills}
            onChange={(e) =>
              setSubSkills([...e.target.selectedOptions].map((o) => o.value))
            }
          >
            <option value="data">Data Analyst</option>
            <option value="ml">ML Engineer</option>
            <option value="web">Web Developer</option>
            <option value="cloud">Cloud Engineer</option>
            <option value="cyber">Cybersecurity</option>
            <option value="software">Software Developer</option>
          </select>

          <button onClick={subscribeToAlerts}>Subscribe</button>
        </div>

        {/* Chatbot */}
        <div className="chatbot-box">
          <h3>Chat with AI Career Assistant</h3>

          <div className="chat-window">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={msg.sender === "user" ? "user-msg" : "bot-msg"}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-input-row">
            <input
              type="text"
              value={chatInput}
              placeholder="Ask something about careers..."
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button onClick={sendChatMessage}>Send</button>
          </div>
        </div>
      </div>
    );
  }

  // =======================================================
  // Not-authenticated UI
  // =======================================================
  return (
    <div className="login-page">
      <div className="login-card">
        <h2>AI Resume Job Recommender</h2>
        <p>Sign in to get personalized job recommendations</p>

        <button className="signin-btn" onClick={() => auth.signinRedirect()}>
          Sign in with Cognito
        </button>
      </div>
    </div>
  );
}

export default App;
