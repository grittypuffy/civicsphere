import {
  Button,
  DialogActions,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  Spinner,
  Textarea,
} from "@fluentui/react-components";
import { createIssue } from "@/lib/utils";
import { useAtom } from "jotai";
import {
  issueDescriptionAtom,
  issueErrorAtom,
  issueIsLoadingAtom,
  issueTitleAtom,
} from "@/lib/store";
import { CreateIssueRequest } from "@/lib/types";
import type { FormEvent } from "react";

export default function CreateIssue({ communityId }: { communityId: string }) {
  const [title, setTitle] = useAtom(issueTitleAtom);
  const [description, setDescription] = useAtom(issueDescriptionAtom);
  const [isLoading, setIsLoading] = useAtom(issueIsLoadingAtom);
  const [error, setError] = useAtom(issueErrorAtom);
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const issuePayload: CreateIssueRequest = {
      title: title,
      description: description,
    };

    try {
      const response = await createIssue(communityId, issuePayload);
    } catch (error) {
      setError("Failed to create issue. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogSurface>
        <DialogTitle>Create Issue</DialogTitle>
        <form onSubmit={handleSubmit}>
          <Field label="Title">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter issue title"
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter issue description"
            />
          </Field>
          {error && <p className="text-red-500">{error}</p>}{" "}
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Cancel</Button>
            </DialogTrigger>

            <Button appearance="primary" type="submit" disabled={isLoading}>
              {isLoading ? <Spinner size="small" /> : "Create Issue"}
            </Button>
          </DialogActions>
        </form>
      </DialogSurface>
    </>
  );
}
