import React, { useState } from "react";
import { useAuth } from "react-oidc-context";
import './App.css';


function App() {
  const auth = useAuth();
  const [resumeText, setResumeText] = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  // Backend API Gateway endpoint (replace with yours)
  const API_URL = "https://f0zssx0ly4.execute-api.eu-north-1.amazonaws.com/ai-job-recommender/recommend";

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
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
      logoutUri
    )}`;
  };

  if (auth.isLoading) return <div className="loading">Loading...</div>;

  if (auth.error)
    return <div className="error">Error: {auth.error.message}</div>;

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
