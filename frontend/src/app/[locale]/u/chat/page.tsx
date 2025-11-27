"use client";

import { Avatar, Button, Textarea, Tooltip } from "@fluentui/react-components";
import {
  DeleteFilled,
  SendFilled,
} from "@fluentui/react-icons";
import { useTranslations } from "next-intl";
import { atom, useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import SpeakButton from "@/components/SpeakButton";

import { ChatData } from "@/lib/types";

type MessageWithId = ChatData & { id: number };

const messagesAtom = atom<MessageWithId[]>([]);

const chatStateAtom = atom({
  input: "",
  isRecording: false,
  isWaiting: false,
});

export default function ChatPage() {
  const t = useTranslations("chat");
  const [messages, setMessages] = useAtom(messagesAtom);
  const [chatState, setChatState] = useAtom(chatStateAtom);
  const { input, isRecording, isWaiting } = chatState;
  const listRef = useRef<HTMLDivElement | null>(null);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState('');
  const suggestions: string[] = [
    t("suggestions.pollsite"),
    t("suggestions.trending"),
    t("suggestions.accessibility"),
  ];

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  function simulateTyping(
    fullText: string,
    messageId: number,
    delay: number = 5
  ) {
    let currentIndex = 0;

    const typeNextChar = () => {
      if (currentIndex < fullText.length) {
        const currentText = fullText.substring(0, currentIndex + 1);

        setMessages((m: MessageWithId[]) =>
          m.map((msg: MessageWithId) =>
            msg.id === messageId ? { ...msg, content: currentText } : msg
          )
        );

        currentIndex++;
        setTimeout(typeNextChar, delay);
      } else {
        setChatState((prev) => ({ ...prev, isWaiting: false }));
      }
    };

    typeNextChar();
  }

  const handleVoiceSubmit = (audioBlob: Blob) => {
    setVoiceBlob(audioBlob);
    const audioBlobUrl = URL.createObjectURL(audioBlob);
    setAudioURL(audioBlobUrl);
  };

  async function handleSend() {
    const text = input.trim();
    if (!text && !voiceBlob) return;
    setChatState((prev) => ({ ...prev, isWaiting: true, input: "" }));
    const userMessage: MessageWithId = {
      id: Date.now(),
      role: "user",
      content: voiceBlob? "[Voice Message]" : "",
    };
    setMessages((m: MessageWithId[]) => [...m, userMessage]);

    simulateTyping(text, userMessage.id);

    const botMessageId = Date.now() + 1;
    const botMessage: MessageWithId = {
      id: botMessageId,
      role: "assistant",
      content: "",
    };
    setMessages((m: MessageWithId[]) => [...m, botMessage]);

    try {
      let response;
      const formData = new FormData();
      if (voiceBlob) {
        formData.append('voice', voiceBlob);
      } else if (text) {
        formData.append('prompt', text);
      }

      response = await fetch("/api/v1/chat/new", {
        method: "POST",
        credentials: 'include',
        body: formData,
      });

      setVoiceBlob(null);
      setAudioURL('');

      if (!response.ok) {
        throw new Error(`HTTP error. Status: ${response.status}`);
      }
      const content: any = await response.json();
      simulateTyping(content.data.content, botMessageId);
    } catch (error) {
      console.error("Error sending message:", error);
      simulateTyping(t("errors.generic"), botMessageId);
      setChatState((prev) => ({ ...prev, isWaiting: false }));
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="min-w-dvw max-w-5xl mx-auto flex flex-col flex-1">
      <div className="flex flex-col flex-1 min-h-0 items-center w-full">
        <div
          ref={listRef}
          className="w-full max-w-5xl overflow-y-auto pr-2 space-y-3 flex-1 min-h-[70dvh] max-h-[70dvh] p-3 lg:p-6 "
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role !== "user" && (
                <div className="mr-3">
                  <Avatar />
                </div>
              )}

              <div
                className={`${
                  m.role === "user"
                    ? "bg-brand text-white self-end"
                    : "bg-white text-ui-heading"
                } max-w-[70%] p-3 rounded-lg shadow-sm`}
              >
                <div className="text-xs mb-1 opacity-90">
                  {m.role === "user" ? t("labels.you") : t("labels.assistant")}
                </div>
                <div className="whitespace-pre-wrap">
                  {m.content ||
                    (m.role !== "user" && isWaiting ? (
                      <span className="opacity-60 italic">
                        {t("labels.typing")}
                      </span>
                    ) : (
                      m.content
                    ))}
                </div>
              </div>

              {m.role === "user" && (
                <div className="ml-3">
                  <Avatar />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex grow max-w-4xl w-full">
          <form className="flex flex-col gap-3 items-start w-full justify-between grow">
            <div className="flex flex-col w-full p-3 h-full gap-3">
              <Textarea
                value={input}
                onChange={(_, data) =>
                  setChatState((prev) => ({ ...prev, input: data.value }))
                }
                onKeyDown={handleKeyDown}
                placeholder={t("inputPlaceholder")}
                className="flex-1 w-full px-24"
                resize="none"
                rows={2}
              />
              <div className="flex justify-between">
                <SpeakButton onVoiceSubmit={handleVoiceSubmit} />

                <div className="flex gap-2 items-center">
                  <Tooltip
                    content={t("tooltip.clearHistory")}
                    relationship="label"
                    positioning="above"
                  >
                    <Button
                      icon={<DeleteFilled />}
                      appearance="subtle"
                      shape="circular"
                      onClick={() => setMessages([])}
                      disabled={isWaiting || messages.length === 0}
                    />
                  </Tooltip>
                  <Button
                    appearance="subtle"
                    onClick={handleSend}
                    disabled={isWaiting || (!input.trim() && !voiceBlob)}
                    shape="circular"
                    icon={<SendFilled />}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
        <p className="text-sm mb-4 opacity-60">Responses are generated by AI and may not be accurate.</p>
      </div>
    </div>
  );
}
