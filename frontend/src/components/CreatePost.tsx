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
  tokens,
} from "@fluentui/react-components";
import { useAtom } from "jotai";
import SpeakButton from "@/components/SpeakButton";
import { useState } from "react";

// Import the renamed atoms
import {
  postDescriptionAtom,
  postErrorAtom,
  postFilesAtom,
  postIsLoadingAtom,
  postSelectedTagsAtom,
  postTitleAtom,
} from "@/lib/store";
import { EditRegular, MicRegular } from "@fluentui/react-icons";
import { atom } from "jotai";

const postTypeAtom = atom<"normal" | "voice">("normal");

export default function CreatePost({ communityId }: { communityId: string }) {
  const [selectedTags, setSelectedTags] = useAtom(postSelectedTagsAtom);
  const [title, setTitle] = useAtom(postTitleAtom);
  const [description, setDescription] = useAtom(postDescriptionAtom);
  const [files, setFiles] = useAtom(postFilesAtom);
  const [isLoading, setIsLoading] = useAtom(postIsLoadingAtom);
  const [error, setError] = useAtom(postErrorAtom);
  const [postType, setPostType] = useAtom(postTypeAtom);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState("");

  const [touched, setTouched] = useState({ title: false, description: false });

  const titleError = touched.title && postType === "normal" && !title.trim();
  const descriptionError =
    touched.description && postType === "normal" && !description.trim();

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
    if (!selectedTags || !voiceBlob) {
      setError("Select tags and record voice before submitting.");
      return;
    }
    setIsLoading(true);
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
      setAudioURL("");

      if (!response.ok) {
        throw new Error("Voice post creation failed");
      }

      const data: any = await response.json();
      console.log("Post created successfully", data);
    } catch (err) {
      setError("Failed to create voice post. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // mark touched to show inline errors
    setTouched({ title: true, description: true });
    setError(null);

    if (postType === "voice") {
      await handleVoicePost();
      return;
    }

    // validation for normal posts
    if (!title.trim() || !description.trim()) {
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    selectedTags.forEach((tag) => formData.append("tags", tag));
    files.forEach((file) => formData.append("files", file));

    try {
      await createPost(communityId, formData);
    } catch (err) {
      setError("Failed to create post. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Styling helpers for the segmented toggle pills
  const pillBase: React.CSSProperties = {
    display: "inline-flex",
    gap: 8,
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: 999,
    cursor: "pointer",
    userSelect: "none",
    fontSize: 13,
    lineHeight: 1,
    border: `1px solid ${tokens.colorNeutralStrokeAccessible}`,
    background: tokens.colorNeutralBackground1,
  };

  const activePill: React.CSSProperties = {
    background: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    border: `1px solid ${tokens.colorBrandForeground1}`,
    boxShadow: `0 2px 6px rgba(13, 110, 253, 0.12)`,
  };

  const inactivePill: React.CSSProperties = {
    background: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
  };

  return (
    <DialogSurface
      style={{
        padding: 20,
        borderRadius: tokens.borderRadiusXLarge,
        boxShadow: tokens.shadow64,
        maxWidth: 760,
        width: "min(92vw, 760px)",
      }}
    >
      <DialogTitle
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
          fontSize: "1.25rem",
          fontWeight: 600,
        }}
      >
        <span>Create Post</span>

        {/* Segmented pill toggle */}
        <div
          role="tablist"
          aria-label="Post type"
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          <button
            type="button"
            aria-pressed={postType === "normal"}
            onClick={() => setPostType("normal")}
            style={{
              ...pillBase,
              ...(postType === "normal" ? activePill : inactivePill),
            }}
            title="Create a normal text post"
          >
            <EditRegular
              style={{
                width: 16,
                height: 16,
                opacity: postType === "normal" ? 1 : 0.85,
              }}
            />
            <span style={{ fontWeight: 600 }}>Normal Post</span>
          </button>

          <button
            type="button"
            aria-pressed={postType === "voice"}
            onClick={() => setPostType("voice")}
            style={{
              ...pillBase,
              ...(postType === "voice" ? activePill : inactivePill),
            }}
            title="Create a voice post"
          >
            <MicRegular
              style={{
                width: 16,
                height: 16,
                opacity: postType === "voice" ? 1 : 0.85,
              }}
            />
            <span style={{ fontWeight: 600 }}>Voice Post</span>
          </button>
        </div>
      </DialogTitle>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        {postType === "normal" ? (
          <>
            <Field
              label="Title"
              required
              validationState={titleError ? "error" : "none"}
            >
              <Input
                value={title}
                onChange={(e: any) => setTitle(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, title: true }))}
                placeholder="Short, descriptive title"
                style={{
                  borderRadius: tokens.borderRadiusMedium,
                  padding: "10px",
                }}
              />
              {titleError && (
                <div style={{ color: "#b02a37", fontSize: 12, marginTop: 6 }}>
                  Title is required.
                </div>
              )}
            </Field>

            <Field
              label="Description"
              required
              validationState={descriptionError ? "error" : "none"}
            >
              <Textarea
                value={description}
                onChange={(e: any) => setDescription(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, description: true }))}
                placeholder="Add details, steps to reproduce, links, etc."
                style={{
                  borderRadius: tokens.borderRadiusMedium,
                  padding: "10px",
                  minHeight: 120,
                }}
              />
              {descriptionError && (
                <div style={{ color: "#b02a37", fontSize: 12, marginTop: 6 }}>
                  Description is required.
                </div>
              )}
            </Field>

            <Field label="Add Files">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <label
                  style={{
                    border: `1px dashed ${tokens.colorNeutralStrokeAccessible}`,
                    padding: "8px 12px",
                    borderRadius: tokens.borderRadiusMedium,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Browse
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    aria-hidden
                  />
                </label>
                <div
                  style={{
                    fontSize: 13,
                    color: tokens.colorNeutralForeground3,
                  }}
                >
                  {files && files.length > 0
                    ? `${files.length} file(s) selected`
                    : "No files selected"}
                </div>
              </div>
            </Field>
          </>
        ) : (
          <>
            <Field label="Voice Recording">
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <SpeakButton onVoiceSubmit={handleVoiceSubmit} />
                {audioURL && (
                  <audio controls src={audioURL} style={{ maxWidth: 300 }} />
                )}
              </div>
            </Field>
          </>
        )}

        <Field label="Tags">
          <Dropdown
            multiselect
            selectedOptions={selectedTags}
            onOptionSelect={(e, data) => {
              if (data.selectedOptions) setSelectedTags(data.selectedOptions);
            }}
            placeholder="Select tags"
            style={{
              borderRadius: tokens.borderRadiusMedium,
              padding: "2px 6px",
            }}
          >
            {TAGS.map((tag, i) => (
              <Option key={i} value={tag} text={tag}>
                {tag}
              </Option>
            ))}
          </Dropdown>
        </Field>

        {error && (
          <div style={{ color: "#b02a37", fontSize: 13, marginTop: -6 }}>
            {error}
          </div>
        )}

        <DialogActions
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
          }}
        >
          <div>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary" disabled={isLoading}>
                Cancel
              </Button>
            </DialogTrigger>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Button
              type="submit"
              appearance="primary"
              disabled={isLoading}
              style={{ minWidth: 140 }}
            >
              {isLoading ? <Spinner size="small" /> : "Create Post"}
            </Button>
          </div>
        </DialogActions>
      </form>
    </DialogSurface>
  );
}
