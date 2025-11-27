import { TAGS } from "@/lib/consts";
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
  Textarea,
  Spinner,
} from "@fluentui/react-components";
import { useAtom } from "jotai";
import { createPost } from "@/lib/utils";

// Import the renamed atoms
import {
  postSelectedTagsAtom,
  postTitleAtom,
  postDescriptionAtom,
  postFilesAtom,
  postIsLoadingAtom,
  postErrorAtom,
} from "@/lib/store";

export default function CreatePost({ communityId }: { communityId: string }) {
  const [selectedTags, setSelectedTags] = useAtom(postSelectedTagsAtom);
  const [title, setTitle] = useAtom(postTitleAtom);
  const [description, setDescription] = useAtom(postDescriptionAtom);
  const [files, setFiles] = useAtom(postFilesAtom);
  const [isLoading, setIsLoading] = useAtom(postIsLoadingAtom);
  const [error, setError] = useAtom(postErrorAtom);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    selectedTags.forEach(tag => {
        formData.append('tags', tag);
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
        <DialogTitle>Create Post</DialogTitle>
        <form onSubmit={handleSubmit}>
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

          <Field label="Add Files">
            <input type="file" multiple onChange={handleFileChange} />
          </Field>

          {error && <div style={{ color: "red" }}>{error}</div>}

          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Cancel</Button>
            </DialogTrigger>

            <Button type="submit" appearance="primary" disabled={isLoading}>
              {isLoading ? <Spinner size="small" /> : "Create Post"}
            </Button>
          </DialogActions>
        </form>
      </DialogSurface>
    </>
  );
}
