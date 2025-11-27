import { TAGS } from "@/lib/consts";
import { Button, DialogActions, DialogSurface, DialogTitle, DialogTrigger, Dropdown, Field, Input, Option, Textarea } from "@fluentui/react-components";
import { useState } from "react";

export default function CreatePost() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  return (
    <>
      <DialogSurface>
        <DialogTitle>Create Post</DialogTitle>
        <form>
          <Field label="Title">
            <Input />
          </Field>

          <Field label="Body">
            <Textarea />
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

          <Field>
            <Button>Add Files</Button>
          </Field>
        </form>
        <DialogActions>
          <DialogTrigger disableButtonEnhancement>
            <Button appearance="secondary">Cancel</Button>
          </DialogTrigger>
        </DialogActions>
      </DialogSurface>
    </>
  )
}
