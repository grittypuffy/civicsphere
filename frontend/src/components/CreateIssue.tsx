'use client'

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
  tokens,
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
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function CreateIssue({ communityId }: { communityId: string }) {
  const t = useTranslations("createIssue");
  const [title, setTitle] = useAtom(issueTitleAtom);
  const [description, setDescription] = useAtom(issueDescriptionAtom);
  const [isLoading, setIsLoading] = useAtom(issueIsLoadingAtom);
  const [error, setError] = useAtom(issueErrorAtom);

  const [touched, setTouched] = useState({
    title: false,
    description: false,
  });

  const titleError = touched.title && !title.trim();
  const descriptionError = touched.description && !description.trim();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setTouched({
      title: true,
      description: true,
    });

    if (!title.trim() || !description.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const issuePayload: CreateIssueRequest = {
      title,
      description,
    };

    try {
      await createIssue(communityId, issuePayload);
    } catch (error) {
      setError(t("errorMessage"));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogSurface
      style={{
        padding: "24px",
        borderRadius: tokens.borderRadiusXLarge,
        boxShadow: tokens.shadow64,
        maxWidth: "520px",
      }}
    >
      <DialogTitle
        style={{
          marginBottom: "12px",
          fontSize: "1.3rem",
          fontWeight: 600,
        }}
      >
        {t("dialogTitle")}
      </DialogTitle>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5"
        style={{ paddingTop: 8 }}
      >
        <Field label={t("titleLabel")} required>
          <Input
            value={title}
            required
            onBlur={() => setTouched((tch) => ({ ...tch, title: true }))}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("titlePlaceholder")}
            style={{
              borderRadius: tokens.borderRadiusMedium,
              padding: "10px",
            }}
          />
          {titleError && (
            <p className="text-red-500 text-xs mt-1">{t("titleRequired")}</p>
          )}
        </Field>

        <Field label={t("descriptionLabel")} required>
          <Textarea
            value={description}
            required
            onBlur={() => setTouched((tch) => ({ ...tch, description: true }))}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("descriptionPlaceholder")}
            style={{
              borderRadius: tokens.borderRadiusMedium,
              padding: "10px",
              minHeight: "120px",
            }}
          />
          {descriptionError && (
            <p className="text-red-500 text-xs mt-1">
              {t("descriptionRequired")}
            </p>
          )}
        </Field>

        {error && (
          <p className="text-red-500 text-sm mt-[-6px]">{error}</p>
        )}

        <DialogActions
          style={{
            marginTop: "8px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <DialogTrigger disableButtonEnhancement>
            <Button appearance="secondary">{t("cancel")}</Button>
          </DialogTrigger>

          <Button
            appearance="primary"
            type="submit"
            disabled={isLoading}
            style={{ minWidth: "120px" }}
          >
            {isLoading ? <Spinner size="small" /> : t("submit")}
          </Button>
        </DialogActions>
      </form>
    </DialogSurface>
  );
}
