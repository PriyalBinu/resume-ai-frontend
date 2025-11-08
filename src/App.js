import React, { useState } from "react";
import "./App.css";

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [message, setMessage] = useState("");
  const [recommendation, setRecommendation] = useState(null);
  const [resumeText, setResumeText] = useState("");

  // ✅ Step 1: File selection
  const handleFileChange = (e) => setResumeFile(e.target.files[0]);

  // ✅ Step 2: Upload file to S3 via presigned URL
  const handleUpload = async () => {
    if (!resumeFile) {
      setMessage("Please select a PDF file first!");
      return;
    }

    try {
      // Ask backend for presigned URL
      const response = await fetch(
        "https://f0zssx0ly4.execute-api.eu-north-1.amazonaws.com/ai-job-recommender/presigned",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: resumeFile.name,
            userId: "user123",
          }),
        }
      );

      const data = await response.json();

      if (!data.uploadUrl) {
        setMessage("❌ Failed to get presigned URL");
        return;
      }

      // Upload PDF directly to S3
      await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/pdf" },
        body: resumeFile,
      });

      setMessage("✅ Resume uploaded successfully to S3!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Error uploading file. Check backend logs.");
    }
  };

  // ✅ Step 3: Get AI job recommendations
  const handleRecommend = async () => {
    if (!resumeText) {
      setMessage("Please paste your resume text first!");
      return;
    }

    try {
      const response = await fetch(
        "https://f0zssx0ly4.execute-api.eu-north-1.amazonaws.com/ai-job-recommender/recommend",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume_text: resumeText }),
        }
      );

      const data = await response.json();
      setRecommendation(data);
      setMessage("✅ Recommendations generated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to get recommendations. Check backend.");
    }
  };

  return (
    <div className="App">
      <h1>AI Resume Job Recommender</h1>

      {/* 🔹 Resume Upload Section */}
      <div className="upload-section">
        <h3>Upload Resume (PDF)</h3>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload to AWS S3</button>
      </div>

      {/* 🔹 Resume Text Input Section */}
      <div className="text-section">
        <h3>Or Paste Resume Text</h3>
        <textarea
          rows="10"
          cols="60"
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume text here..."
        />
        <br />
        <button onClick={handleRecommend}>Get Recommendations</button>
      </div>

      {/* 🔹 Output */}
      {message && <p><strong>{message}</strong></p>}

      {recommendation && (
        <div className="result">
          <h3>{recommendation.summary}</h3>
          <ul>
            {recommendation.recommended_jobs.map((job, idx) => (
              <li key={idx}>{job}</li>
            ))}
          </ul>
          <p><strong>Confidence:</strong> {recommendation.confidence}</p>
          <p><strong>Insights:</strong> {recommendation.insights}</p>
        </div>
      )}
    </div>
  );
}

export default App;
