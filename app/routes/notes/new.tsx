import * as React from "react";
import { Form, json, redirect, useActionData } from "remix";
import type { ActionFunction } from "remix";
import Alert from "@reach/alert";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import { createNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";

type ActionData = {
  errors?: {
    title?: string;
    body?: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const title = formData.get("title");
  const body = formData.get("body");

  if (typeof title !== "string" || title.length === 0) {
    return json<ActionData>(
      { errors: { title: "Title is required" } },
      { status: 400 }
    );
  }

  if (typeof body !== "string" || body.length === 0) {
    return json<ActionData>(
      { errors: { body: "Body is required" } },
      { status: 400 }
    );
  }

  const note = await createNote({ title, body, userId });

  return redirect(`/notes/${note.id}`);
};

export default function NewNotePage() {
  const actionData = useActionData() as ActionData;
  const titleRef = React.useRef<HTMLInputElement>(null);
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.body) {
      bodyRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div>
        <TextField
          id="title"
          inputRef={titleRef}
          required
          label="title address"
          variant="outlined"
          autoFocus
          name="title"
          type="title"
          autoComplete="title"
          aria-invalid={actionData?.errors?.title ? true : undefined}
          aria-describedby="title-error"
          error={actionData?.errors?.title ? true : undefined}
          helperText={actionData?.errors?.title}
          fullWidth
        />
        {actionData?.errors?.title && (
          <Alert className="pt-1 text-red-700" id="title=error">
            {actionData.errors.title}
          </Alert>
        )}
      </div>

      <div>
        <TextField
          inputRef={bodyRef}
          name="body"
          label="Body"
          variant="outlined"
          aria-invalid={actionData?.errors?.body ? true : undefined}
          aria-describedby="body-error"
          error={actionData?.errors?.body ? true : undefined}
          helperText={actionData?.errors?.body}
          aria-errormessage={
            actionData?.errors?.body ? "body-error" : undefined
          }
          fullWidth
          multiline
          rows={8}
        />
        {actionData?.errors?.body && (
          <Alert className="pt-1 text-red-700" id="body=error">
            {actionData.errors.body}
          </Alert>
        )}
      </div>

      <div className="text-right">
        <Button variant="contained" type="submit" fullWidth>
          Save
        </Button>
      </div>
    </Form>
  );
}
