"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle the submission logic here
    console.log("Submitted URL:", youtubeUrl);
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
      </div>
    </div>
  );
}
