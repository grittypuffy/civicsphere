"use client";

import { useState } from "react";
import { textToSpeech } from "../app/lib/actions";

import { Button, Spinner, tokens } from "@fluentui/react-components";
import { Speaker024Filled } from "@fluentui/react-icons";

interface SpeakButtonProps {
  text: string;
}

export default function TTSButton({ text }: SpeakButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSpeak() {
    setIsLoading(true);

    try {
      const base64Audio = await textToSpeech(text);

      const audioBlob = new Blob([Buffer.from(base64Audio, "base64")], {
        type: "audio/mp3",
      });

      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      console.error("TTS failed:", err);
    }

    setIsLoading(false);
  }

  return (
    <Button
      onClick={handleSpeak}
      disabled={isLoading}
      appearance="primary"
      icon={<Speaker024Filled aria-hidden="true" />}
      aria-label="Speak content from post or issue"
    >
      {isLoading ? (
        <>
          <Spinner size={"small"} /> Generating
        </>
      ) : (
        "Speak"
      )}
    </Button>
  );
}