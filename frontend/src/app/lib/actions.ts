"use server";

import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export async function textToSpeech(text: string) {
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env.TTS_KEY!,
    process.env.TTS_REGION!
  );

  speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";

  const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
  const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

  return new Promise<string>((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      result => {
        synthesizer.close();
        resolve(Buffer.from(result.audioData).toString("base64"));
      },
      err => {
        synthesizer.close();
        reject(err);
      }
    );
  });
}