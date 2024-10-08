"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

// Function to extract the YouTube video ID from a URL
function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export default function Home() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [error, setError] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [blogTopics, setBlogTopics] = useState<string[]>([]);
  // Optional: State and useEffect for debouncing input
  const [debouncedUrl, setDebouncedUrl] = useState(youtubeUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
    setBlogTopics([]);
    setIsLoading(true);
    setIsProcessing(true);
    
    if (!videoId) {
      setError("Please enter a valid YouTube URL.");
      setIsLoading(false);
      return;
    }

    try {
      const transcriptResponse = await fetch('/api/getTranscript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ youtubeUrl })
      });

      const transcriptData = await transcriptResponse.json();

      if (!transcriptResponse.ok) {
        throw new Error(transcriptData.error || 'Failed to fetch transcript');
      }

      // Now that we have the transcript, let's send it to our Flask backend
      const flaskResponse = await fetch('http://127.0.0.1:5000/transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transcript: transcriptData.transcript })
      });

      console.log(flaskResponse);

      const flaskData = await flaskResponse.json();

      if (!flaskResponse.ok) {
        throw new Error(flaskData.error || 'Failed to process transcript');
      }

      console.log('Blog topics:', flaskData.blog_topics);
      console.log('Products:', flaskData.products);

      setBlogTopics(flaskData.blog_topics);      
      
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to process the video. Please try again.');
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  const getThumbnailUrl = (id: string) => `https://img.youtube.com/vi/${id}/0.jpg`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-lg bg-gray-800 shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Vidblog
        </h1>
        {videoId && (
          <div className="mt-6 relative">
            {videoTitle && (
              <h2 className="text-white text-left mb-2">
                {videoTitle}
              </h2>
            )}
            <div className="relative">
              <img
                src={getThumbnailUrl(videoId)}
                alt="Video Thumbnail"
                className="w-full rounded-md mb-4"
              />
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>
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
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Submit'}
          </Button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        
        {blogTopics.length > 0 && 
          <div className="mt-4">
            <h3 className="text-white text-left mb-2">Generated Blog Topic:</h3>
            <p className="text-white text-left pl-4">{blogTopics[0]}</p>
          </div>
        }
      </div>
    </div>
  );
}