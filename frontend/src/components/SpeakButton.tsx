"use client";

import { Button } from "@fluentui/react-components";
import React, { useRef, useState } from "react";

interface SpeakButtonProps {
  onVoiceSubmit: (voice: Blob) => void;
}

const SpeakButton: React.FC<SpeakButtonProps> = ({ onVoiceSubmit }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        onVoiceSubmit(audioBlob);

        // stop tracks
        mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Mic error:", error);
      alert("Microphone access denied Check permissions!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      className="p-2 rounded-full flex items-center justify-center transition-all"
      style={{
        backgroundColor: isRecording
          ? "rgb(220, 38, 38)"
          : "rgb(var(--primary-color))",
        color: "#fff",
        width: "40px",
        height: "40px",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>

      {isRecording && (
        <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full animate-ping"></span>
      )}
    </Button>
  );
};

export default SpeakButton;
