import React, { useState } from "react";

function App() {
  const [resumeText, setResumeText] = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setRecommendations(null);

    try {
      const response = await fetch("https://f0zssx0ly4.execute-api.eu-north-1.amazonaws.com/ai-job-recommender/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resumeText }),
      });

      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to get recommendations. Check Flask backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "40px" }}>
      <h1>AI Job Recommender</h1>
      <p>Paste your resume text below and get AI-powered job recommendations.</p>

      <textarea
        rows="10"
        cols="70"
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        placeholder="Paste your resume here..."
        style={{ padding: "10px" }}
      />

      <br /><br />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Analyzing..." : "Get Recommendations"}
      </button>

      {recommendations && (
        <div style={{ marginTop: "20px" }}>
          <h3>{recommendations.summary}</h3>
          <p>
            <b>Recommended Jobs:</b> {recommendations.recommended_jobs.join(", ")}
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
  );
}

export default App;
