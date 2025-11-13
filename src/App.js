import React, { useState } from "react";
import { useAuth } from "react-oidc-context";
import "./App.css";

/* -------------------------------
   API BASE (NO NEWLINE BUG)
-------------------------------- */
const API_BASE =
  "https://f0zssx0ly4.execute-api.eu-north-1.amazonaws.com/ai-job-recommender";

function App() {
  const auth = useAuth();

  // Resume states
  const [resumeText, setResumeText] = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  // Chatbot states
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  /* =====================================================
       📌 FUNCTION: Get Job Recommendations
  ====================================================== */
  const handleRecommend = async () => {
    if (!resumeText.trim()) return alert("Please paste resume text!");

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resumeText }),
      });

      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error(error);
      alert("Failed to get job recommendations.");
    }
    setLoading(false);
  };

  /* =====================================================
       📌 FUNCTION: chatbot message send
  ====================================================== */
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
       AUTH CONTROL
  ====================================================== */
  if (auth.isLoading) return <div>Loading...</div>;
  if (auth.error) return <div>Error: {auth.error.message}</div>;

  /* =====================================================
       LOGGED IN VIEW
  ====================================================== */
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

        {/* Resume box */}
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
              <h4>{recommendations.grok_analysis}</h4>

              <p>
                <b>Jobs:</b>{" "}
                {recommendations.recommended_jobs.join(", ")}
              </p>
            </div>
          )}
        </div>

        {/* Chatbot */}
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
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask something..."
            />
            <button onClick={sendChatMessage}>Send</button>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
       LOGIN VIEW
  ====================================================== */
  return (
    <div className="login-page">
      <div className="login-card">
        <h2>AI Resume Job Recommender</h2>
        <button className="signin-btn" onClick={() => auth.signinRedirect()}>
          Sign in with Cognito
        </button>
      </div>
    </div>
  );
}

export default App;
