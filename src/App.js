import React, { useState } from "react";
import { useAuth } from "react-oidc-context";
import "./App.css";

function App() {
  const auth = useAuth();
  const [resumeText, setResumeText] = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Correct API gateway base URL (NO /recommend at the end)
  const API_BASE =
    "https://f0zssx0ly4.execute-api.eu-north-1.amazonaws.com/ai-job-recommender";

  /* =====================================================
      📌 Get Job Recommendation
  ====================================================== */
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

      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error(error);
      alert("Backend error: Could not get recommendations.");
    }

    setLoading(false);
  };

  /* =====================================================
      🔐 Authentication Handling
  ====================================================== */
  if (auth.isLoading) return <div className="loading">Loading...</div>;
  if (auth.error) return <div className="error">Error: {auth.error.message}</div>;

  /* =====================================================
      🔐 If user is logged in
  ====================================================== */
  if (auth.isAuthenticated) {
    return (
      <div className="app-container">
        <header>
          <h2>AI Resume Job Recommender</h2>
          <p>
            Welcome, <b>{auth.user?.profile.email}</b>
          </p>

          <button className="signout-btn" onClick={() => auth.removeUser()}>
            Sign out
          </button>
        </header>

        {/* --------- RESUME INPUT --------- */}
        <div className="content">
          <h3>Paste your resume text below:</h3>

          <textarea
            className="resume-box"
            rows="10"
            placeholder="Paste your resume text here..."
            value={resumeText}
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
              <h4>AI Recommendation Summary</h4>

              <p>
                <b>Recommended Jobs:</b>{" "}
                {recommendations.recommended_jobs.join(", ")}
              </p>

              {recommendations.grok_analysis && (
                <p>
                  <b>AI Insights:</b> {recommendations.grok_analysis}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* =====================================================
      🔓 If NOT logged in
  ====================================================== */
  return (
    <div className="login-page">
      <div className="login-card">
        <h2>AI Resume Job Recommender</h2>
        <p>Sign in to get personalized job recommendations</p>

        <button
          className="signin-btn"
          onClick={() => auth.signinRedirect()}
        >
          Sign in with Cognito
        </button>
      </div>
    </div>
  );
}

export default App;
