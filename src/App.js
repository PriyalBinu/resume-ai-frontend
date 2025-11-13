import React, { useState } from "react";
import { useAuth } from "react-oidc-context";
import './App.css';
import AWS from 'aws-sdk';

function App() {
  const auth = useAuth();
  const [resumeText, setResumeText] = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");

  // Backend API Gateway endpoint (replace with yours)
  const API_URL = "https://f0zssx0ly4.execute-api.eu-north-1.amazonaws.com/ai-job-recommender/recommend";

  // 👇 AWS Lex Configuration
  AWS.config.region = "us-east-1"; // Lex available region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: "eu-north-1:02c7e1fa-ae05-4714-82e8-a50bfb76d688", // your Identity Pool ID
  });

  const lexRuntime = new AWS.LexRuntimeV2();

  const handleLexMessage = async () => {
    if (!userMessage.trim()) return;

    const params = {
      botId: "YOUR_LEX_BOT_ID", // ⚠️ replace after creating Lex bot
      botAliasId: "YOUR_LEX_ALIAS_ID",
      localeId: "en_US",
      sessionId: "user-" + Date.now(),
      text: userMessage,
    };

    setMessages(prev => [...prev, { from: "user", text: userMessage }]);
    setUserMessage("");

    try {
      const response = await lexRuntime.recognizeText(params).promise();
      const reply = response.messages?.[0]?.content || "I'm here to help with job suggestions!";
      setMessages(prev => [...prev, { from: "bot", text: reply }]);
    } catch (err) {
      console.error("Lex error:", err);
      setMessages(prev => [...prev, { from: "bot", text: "Sorry, I couldn't process that." }]);
    }
  };

  const handleRecommend = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resumeText }),
      });
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to get recommendation. Check backend connection.");
    }
    setLoading(false);
  };

  const signOutRedirect = () => {
    const clientId = "58hc6tvb57fio4hlmdeht6qnu5";
    const logoutUri = "https://main.dt99oihfbmpcm.amplifyapp.com/";
    const cognitoDomain = "https://eu-north-19cwab85xs.auth.eu-north-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) return <div className="loading">Loading...</div>;
  if (auth.error) return <div className="error">Error: {auth.error.message}</div>;

  // ✅ Authenticated users
  if (auth.isAuthenticated) {
    return (
      <div className="app-container">
        <header>
          <h2>AI Resume Job Recommender</h2>
          <p>Welcome, <b>{auth.user?.profile.email}</b></p>
          <button className="signout-btn" onClick={() => auth.removeUser()}>
            Sign out
          </button>
        </header>

        <div className="content">
          <h3>Paste your resume text below:</h3>
          <textarea
            className="resume-box"
            rows="10"
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          ></textarea>
          <br />
          <button className="recommend-btn" onClick={handleRecommend} disabled={loading}>
            {loading ? "Analyzing..." : "Get AI Recommendations"}
          </button>

          {recommendations && (
            <div className="results">
              <h4>{recommendations.summary}</h4>
              <p><b>Recommended Jobs:</b> {recommendations.recommended_jobs.join(", ")}</p>
              <p><b>Confidence:</b> {recommendations.confidence}</p>
              <p><b>Insights:</b> {recommendations.insights}</p>
            </div>
          )}

          {/* Chatbot Section */}
          <div className="chatbot">
            <h3>💬 Ask the Job Assistant</h3>
            <div className="chat-box">
              {messages.map((msg, i) => (
                <div key={i} className={msg.from === "user" ? "user-msg" : "bot-msg"}>
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Ask something..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
              />
              <button onClick={handleLexMessage}>Send</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🚀 Not Authenticated
  return (
    <div className="login-page">
      <div className="login-card">
        <h2>AI Resume Job Recommender</h2>
        <p>Sign in securely to get job recommendations powered by AI</p>
        <button className="signin-btn" onClick={() => auth.signinRedirect()}>
          Sign in with Cognito
        </button>
      </div>
    </div>
  );
}

export default App;
