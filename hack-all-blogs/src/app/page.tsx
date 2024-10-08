"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Function to extract the YouTube video ID from a URL
function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export default function Home() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>("");

  // Optional: State and useEffect for debouncing input
  const [debouncedUrl, setDebouncedUrl] = useState(youtubeUrl);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUrl(youtubeUrl);
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [youtubeUrl]);

  useEffect(() => {
    const extractedVideoId = extractVideoId(debouncedUrl);
    if (extractedVideoId) {
      setVideoId(extractedVideoId);
      setError("");
    } else if (debouncedUrl.trim() === "") {
      setVideoId(null);
      setVideoTitle("");
      setError("");
    } else {
      setVideoId(null);
      setVideoTitle("");
      setError("Invalid YouTube URL.");
    }
  }, [debouncedUrl]);

  // Fetch the video title when videoId changes
  useEffect(() => {
    const fetchVideoTitle = async (id: string) => {
      try {
        const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
        if (!response.ok) {
          throw new Error("Failed to fetch video title.");
        }
        const data = await response.json();
        setVideoTitle(data.title);
      } catch (err) {
        console.error("Error fetching video title:", err);
        setVideoTitle("Unknown Title");
      }
    };

    if (videoId) {
      fetchVideoTitle(videoId);
    }
  }, [videoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTranscript("");
    
    if (!videoId) {
      setError("Please enter a valid YouTube URL.");
      return;
    }

    try {
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

  const getThumbnailUrl = (id: string) => `https://img.youtube.com/vi/${id}/0.jpg`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-lg bg-gray-800 shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          YouTube to Blogs
        </h1>
        {videoId && (
          <div className="mt-6">
            {videoTitle && (
              <h2 className="text-white text-left">
                {videoTitle}
              </h2>
            )}
            <img
              src={getThumbnailUrl(videoId)}
              alt="Video Thumbnail"
              className="w-full rounded-md mb-4"
            />
          </div>
        )}
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