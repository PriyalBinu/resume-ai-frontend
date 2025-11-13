import React, { useState } from "react";
import { useAuth } from "react-oidc-context";
import "./App.css";

/* -------------------------------
   API BASE (NO EXTRA /recommend)
-------------------------------- */
const API_BASE =
  "https://f0zssx0ly4.execute-api.eu-north-1.amazonaws.com/ai-job-recommender";

function App() {
  const auth = useAuth();

  // Resume recommendation states
  const [resumeText, setResumeText] = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  // Chatbot states
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  /* =====================================================
      📌 FUNCTION: Get Job Recommendations
     ===================================================== */
  const handleRecommend = async () => {
    if (!resumeText.trim()) return alert("Please paste resume text!");

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resumeText }),
      });

      if (!response.ok) throw new Error(`Server Error ${response.status}`);

      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to get job recommendations.");
    }
    setLoading(false);
  };

  /* =====================================================
      📌 FUNCTION: Chatbot message send
     ===================================================== */
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput("");

    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!response.ok) throw new Error("Chatbot server error");

      const data = await response.json();

      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.reply || "No response." },
      ]);
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error contacting chatbot." },
      ]);
    }
  };

  /* =====================================================
      🔐 Authentication Handling
     ===================================================== */
  if (auth.isLoading) return <div className="loading">Loading...</div>;
  if (auth.error) return <div className="error">Error: {auth.error.message}</div>;

  /* =====================================================
      🔐 IF USER IS LOGGED IN
     ===================================================== */
  if (auth.isAuthenticated) {
    return (
      <div className="app-container">
        <header className="top-bar">
          <h2>AI Resume Job Recommender</h2>
          <p>
            Welcome, <b>{auth.user?.profile.email}</b>
          </p>
          <button className="signout-btn" onClick={() => auth.removeUser()}>
            Sign out
          </button>
        </header>

        {/* --------- RESUME RECOMMENDATION --------- */}
        <div className="content-box">
          <h3>Paste your Resume Text</h3>

          <textarea
            className="resume-box"
            rows="8"
            value={resumeText}
            placeholder="Paste your resume text here..."
            onChange={(e) => setResumeText(e.target.value)}
          ></textarea>

          <button
            className="recommend-btn"
            onClick={handleRecommend}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Get AI Recommendations"}
          </button>

          {recommendations && (
            <div className="results">
              <h4>{recommendations.summary}</h4>
              <p>
                <b>Jobs:</b> {recommendations.recommended_jobs.join(", ")}
              </p>
              <p>
                <b>Confidence:</b> {recommendations.confidence}
              </p>
              <p>
                <b>Insights:</b> {recommendations.insights}
              </p>
            </div>
          )}
        </div>

        {/* --------- CHATBOT SECTION --------- */}
        <div className="chatbot-box">
          <h3>Chat with AI Career Assistant</h3>

          <div className="chat-window">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
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
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about careers..."
            />
            <button onClick={sendChatMessage}>Send</button>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
      🔓 IF NOT LOGGED IN — LOGIN SCREEN
     ===================================================== */
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
