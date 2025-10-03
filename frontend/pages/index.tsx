"use client";
import { useState } from "react";
import API from "../utils/api";
import AnimatedText from "../components/AnimatedText";
import FileUpload from "../components/FileUpload";
import StoryDisplay from "../components/StoryDisplay";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateFromText() {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await API.post("/generate_from_text", { prompt });
      setStory(res.data.story);
    } catch (err: any) {
      setStory("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="center-root">
      <div className="flex flex-col items-center max-w-3xl w-full px-6">
        {/* Title */}
        <h1 className="flex items-center gap-6 text-5xl sm:text-6xl md:text-7xl lg:text-15xl font-extrabold drop-shadow-xl mb-8">
          <span className="bg-gradient-to-r from-blue-300 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Story Wizard
          </span>
          <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl">🧙</span>
        </h1>

        {/* Subtitle */}
        <AnimatedText />

        {/* Input Bubble */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20 mt-8 w-full">
          <div className="bubble-input-container">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="✨ Enter your magical idea"
              className="bubble-input-field"
            />

            <button
              onClick={generateFromText}
              disabled={loading}
              className="bubble-send-btn"
            >
              {loading ? (
                <span className="loading-spinner">⏳</span>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20 mt-6 w-full">
          <h3 className="text-lg font-semibold text-blue-200 mb-4">
            Generate Story using Audio or a Picture
          </h3>

          <div className="upload-container">
            <FileUpload
              type="audio"
              onResult={(data) => setStory(data.story || JSON.stringify(data))}
            >
              <div className="upload-bubble">
                <span className="upload-icon">🎵</span>
                <span>Upload Audio</span>
              </div>
            </FileUpload>

            <FileUpload
              type="image"
              onResult={(data) => setStory(data.story || JSON.stringify(data))}
            >
              <div className="upload-bubble">
                <span className="upload-icon">🖼️</span>
                <span>Upload Image</span>
              </div>
            </FileUpload>
          </div>
        </div>

        {/* Story Display */}
        {story && <StoryDisplay story={story} />}
      </div>
    </div>
  );
}
