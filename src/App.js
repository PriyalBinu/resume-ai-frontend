import React, { useState } from "react";
import { useAuth } from "react-oidc-context";
import "./App.css";

function App() {
  const auth = useAuth();

  // States
  const [resumeText, setResumeText] = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [subEmail, setSubEmail] = useState("");
  const [subSkills, setSubSkills] = useState([]);

  // --------------------------------------------------------------------
  // ✅ FINAL WORKING BACKEND (DO NOT CHANGE THIS)
  // --------------------------------------------------------------------
  const API_BASE =
    "https://f0zssx0ly4.execute-api.eu-north-1.amazonaws.com/ai-job-recommender/api";

  const SNS_API = API_BASE;

  // --------------------------------------------------------------------
  // ⭐ Get Job Recommendations
  // --------------------------------------------------------------------
  const handleRecommend = async () => {
    if (!resumeText.trim()) {
      alert("Please paste your resume first!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resumeText }),
      });

      if (!response.ok) throw new Error("Backend error");

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      console.error(err);
      alert("Backend error: Could not get recommendations.");
    }
    setLoading(false);
  };

  // --------------------------------------------------------------------
  // ⭐ SNS Email Subscription
  // --------------------------------------------------------------------
  const subscribeToAlerts = async () => {
    if (!subEmail) return alert("Enter your email!");
    if (subSkills.length === 0) return alert("Select at least one skill!");

    try {
      const res = await fetch(`${SNS_API}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail, skills: subSkills }),
      });

      if (!res.ok) throw new Error("Subscribe error");

      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert("Could not subscribe. Check backend.");
    }
  };

  // --------------------------------------------------------------------
  // ⭐ ChatGPT Chatbot
  // --------------------------------------------------------------------
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

      const data = await response.json();
      const botReply = data?.choices?.[0]?.message?.content || "No response.";

      setChatMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: "ChatGPT API error." },
      ]);
    }
  };

  // --------------------------------------------------------------------
  // Authentication Handling
  // --------------------------------------------------------------------
  if (auth.isLoading) return <div>Loading...</div>;
  if (auth.error) return <div>Error: {auth.error.message}</div>;

  if (auth.isAuthenticated) {
    return (
      <div className="app-container">
        <header>
          <h2>AI Resume Job Recommender</h2>
          <p>
            Welcome, <b>{auth.user?.profile.email}</b>
          </p>
          <button onClick={() => auth.removeUser()}>Sign out</button>
        </header>

        {/* Resume Section */}
        <div className="content">
          <h3>Paste your resume text below:</h3>

          <textarea
            rows="10"
            className="resume-box"
            placeholder="Paste your resume..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          ></textarea>

          <button onClick={handleRecommend} disabled={loading}>
            {loading ? "Analyzing..." : "Get AI Recommendations"}
          </button>

          {recommendations && (
            <div className="results">
              <h4>AI Recommendation Summary</h4>
              <p>
                <b>Recommended Jobs:</b>{" "}
                {recommendations.recommended_jobs.join(", ")}
              </p>
              <p>
                <b>AI Insights:</b> {recommendations.insights}
              </p>
            </div>
          )}
        </div>

        {/* SNS Subscription */}
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
            {chatMessages.map((msg, i) => (
              <div key={i} className={msg.sender === "user" ? "user-msg" : "bot-msg"}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-input-row">
            <input
              type="text"
              value={chatInput}
              placeholder="Ask something..."
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button onClick={sendChatMessage}>Send</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>AI Resume Job Recommender</h2>
        <p>Sign in to continue</p>
        <button onClick={() => auth.signinRedirect()}>Sign in with Cognito</button>
      </div>
    </div>
  );
}

export default App;
