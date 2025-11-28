import { TAGS } from "@/lib/consts";
import { createPost } from "@/lib/utils";
import {
  Button,
  DialogActions,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Dropdown,
  Field,
  Input,
  Option,
  Spinner,
  Textarea,
} from "@fluentui/react-components";
import { useAtom } from "jotai";
import SpeakButton from "@/components/SpeakButton";
import { useState } from "react";

// Reuse issue atoms from the store for title/description/loading/error
import {
  issueDescriptionAtom,
  issueErrorAtom,
  issueIsLoadingAtom,
  issueTitleAtom,
} from "@/lib/store";
import { EditRegular, MicRegular } from "@fluentui/react-icons";
import { atom } from "jotai";

const postTypeAtom = atom<"normal" | "voice">("normal");

export default function CreatePost({ communityId }: { communityId: string }) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [title, setTitle] = useAtom(issueTitleAtom);
  const [description, setDescription] = useAtom(issueDescriptionAtom);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useAtom(issueIsLoadingAtom);
  const [error, setError] = useAtom(issueErrorAtom);
  const [postType, setPostType] = useAtom(postTypeAtom);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleVoiceSubmit = (audioBlob: Blob) => {
    setVoiceBlob(audioBlob);
    const audioBlobUrl = URL.createObjectURL(audioBlob);
    setAudioURL(audioBlobUrl);

  };
  const handleVoicePost = async () => {
    if (!selectedTags || !voiceBlob) return;
    const formData = new FormData();
    selectedTags.forEach((tag) => {
      formData.append("tags", tag);
    });
    formData.append("voice", voiceBlob);

    try {
      const response = await fetch(`/api/v1/c/${communityId}/post/voice`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      setVoiceBlob(null);
      setAudioURL('');

      if (!response.ok) {
        throw new Error("Voice post creation failed");
      }

      const data: any = await response.json();
      console.log("Post created successfully", data);
    } catch (error) {
      setError("Failed to create voice post. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (postType === "voice") {
      handleVoicePost();
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    selectedTags.forEach((tag) => {
      formData.append("tags", tag);
    });
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await createPost(communityId, formData);
    } catch (error) {
      setError("Failed to create post. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogSurface>
        <DialogTitle>
          <div className="flex justify-between">
            <p>Create Post</p>
            {postType === "normal" ? (
              <Button
                icon={<MicRegular />}
                appearance="secondary"
                shape="circular"
                size="small"
                onClick={() => setPostType("voice")}
              >
                Create Voice Post
              </Button>
            ) : (
              <Button
                icon={<EditRegular />}
                appearance="secondary"
                shape="circular"
                size="small"
                onClick={() => setPostType("normal")}
              >
                Normal Post
              </Button>
            )}
          </div>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          {postType === "normal" ? (
            <>
              <Field label="Title">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Field>

              <Field label="Description">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </Field>
              <Field label="Add Files">
                <input type="file" multiple onChange={handleFileChange} />
              </Field>
            </>
          ) : (
            <>
              <Field label="Voice Recording">
                <SpeakButton onVoiceSubmit={handleVoiceSubmit} />
              </Field>
            </>
          )}
          <Field label="Tags">
            <Dropdown
              multiselect
              value={selectedTags.join(", ")}
              selectedOptions={selectedTags}
              onOptionSelect={(event, data) => {
                if (data.selectedOptions) {
                  setSelectedTags(data.selectedOptions);
                }
              }}
            >
              {TAGS.map((tag, id) => (
                <Option key={id} value={tag} text={tag}>
                  {tag}
                </Option>
              ))}
            </Dropdown>
          </Field>

          {error && <div style={{ color: "red" }}>{error}</div>}
        </form>

        <DialogActions>
          <DialogTrigger disableButtonEnhancement>
            <Button appearance="secondary">Cancel</Button>
          </DialogTrigger>

          <Button type="submit" appearance="primary" disabled={isLoading} onClick={handleSubmit}>
            {isLoading ? <Spinner size="small" /> : "Create Post"}
          </Button>
        </DialogActions>
      </DialogSurface>
    </>
  );
}
