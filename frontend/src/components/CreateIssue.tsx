import { Button, DialogActions, DialogSurface, DialogTitle, DialogTrigger, Field, Input, Textarea } from "@fluentui/react-components";

export default function CreateIssue() {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  }
  return (
    <>
      <DialogSurface>
        <DialogTitle>Create Issue</DialogTitle>
        <form onSubmit={handleSubmit}>
          <Field label="Title">
            <Input />
          </Field>

          <Field label="Description">
            <Textarea />
          </Field>
        </form>
        <DialogActions>
          <DialogTrigger disableButtonEnhancement>
            <Button appearance="secondary">Cancel</Button>
          </DialogTrigger>
          <Button appearance="primary">Create Issue</Button>
        </DialogActions>
      </DialogSurface>
    </>
  )
}
