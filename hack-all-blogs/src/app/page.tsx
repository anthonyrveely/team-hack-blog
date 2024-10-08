"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTranscript("");
    try {
      console.log(youtubeUrl);
      const response = await fetch('/api/getTranscript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ youtubeUrl })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transcript');
      }

      setTranscript(data.transcript);
    } catch (error) {
      console.error('Error fetching transcript:', error);
      setError('Failed to fetch transcript. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-lg bg-gray-800 shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          YouTube to Blogs
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="Enter YouTube URL"
            className="bg-gray-700 text-white placeholder:text-gray-400"
          />
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 transition-all duration-300"
          >
            Submit
          </Button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {transcript && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-white mb-2">Transcript:</h2>
            <p className="text-gray-300">{transcript}</p>
          </div>
        )}
      </div>
    </div>
  );
}
