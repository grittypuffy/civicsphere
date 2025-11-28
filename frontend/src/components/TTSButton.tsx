"use client";

import { useState } from "react";
import { textToSpeech } from "../app/lib/actions";

import { Button, Spinner } from "@fluentui/react-components";
import { ImmersiveReaderFilled } from "@fluentui/react-icons/svg/immersive-reader";

interface SpeakButtonProps {
  text: string;
}

export default function TTSButton({ text }: SpeakButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  async function handleSpeak() {
    setIsLoading(true);

    try {
      const base64Audio = await textToSpeech(text);

      const audioBlob = new Blob([Buffer.from(base64Audio, "base64")], {
        type: "audio/mp3",
      });

      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      setIsSpeaking(true);
      audio.play();
    } catch (err) {
      console.error("TTS failed:", err);
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }

  return (
    <Button
      onClick={handleSpeak}
      disabled={isLoading}
      appearance={isSpeaking ? "primary" : "secondary"}
      icon={<ImmersiveReaderFilled aria-hidden="true" />}
      aria-label="Speak content from post or issue"
      size="small"
    >
      {isLoading ? (
        <>
          <Spinner size={"tiny"} /> Generating
        </>
      ) : (
        "Speak"
      )}
    </Button>
  );
}
