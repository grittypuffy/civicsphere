"use client";

import { Mic24Regular } from "@fluentui/react-icons";
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
      appearance={isRecording ? "primary" : "secondary"}
      icon={<Mic24Regular aria-hidden="true"/>}
      aria-label="Speak"
    >
      {isRecording && (
        <span className="absolute top-0 right-0 bg-red-500 rounded-full animate-ping"></span>
      )}
    </Button>
  );
};

export default SpeakButton;
