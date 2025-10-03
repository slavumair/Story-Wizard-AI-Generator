"use client";
import { useRef, useState } from "react";

interface FileUploadProps {
  type: "audio" | "image";
  onResult: (data: any) => void;
  children: React.ReactNode;
}

export default function FileUpload({ type, onResult, children }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false); // ✅ new loading state

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append(type === "audio" ? "audio" : "image", file);

    const endpoint =
      type === "audio"
        ? "http://localhost:5000/generate_story_from_audio"
        : "http://localhost:5000/generate_story_from_image";

    setLoading(true); // start loading
    try {
      const res = await fetch(endpoint, { method: "POST", body: formData });

      let data;
      if (res.ok) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { story: "❌ Server Error:\n" + text };
      }

      onResult(data);
    } catch (err: any) {
      onResult({ story: "❌ " + err.message });
    } finally {
      setLoading(false); // stop loading
      if (inputRef.current) inputRef.current.value = ""; // reset file input
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={type === "audio" ? "audio/*" : "image/*"}
        style={{ display: "none" }}
        onChange={handleChange}
      />

      <div
        onClick={handleClick}
        style={{ cursor: loading ? "default" : "pointer" }}
      >
        {loading ? (
          <div className="upload-bubble loading">
            {type === "audio" ? "⏳ Generating..." : "⏳ Generating..."}
          </div>
        ) : (
          children
        )}
      </div>
    </>
  );
}
