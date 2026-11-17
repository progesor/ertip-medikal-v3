"use client";

import { FieldLabel, useField, useTheme } from "@payloadcms/ui";
import type { CodeFieldClientProps } from "payload";
import { MdEditor } from "md-editor-rt";
import { useId, useState } from "react";
import "md-editor-rt/lib/style.css";

export function MarkdownEditor({
  field,
  path,
  readOnly,
}: CodeFieldClientProps) {
  const { value, setValue } = useField<string>({ path });
  const { theme } = useTheme();
  const inputId = useId();
  const [formatting, setFormatting] = useState(false);

  return (
    <div className="ertip-description">
      <div className="ertip-description__header">
        <FieldLabel
          htmlFor={inputId}
          path={path}
          label={field.label}
          localized={field.localized}
          required={field.required}
        />
        <button
          type="button"
          aria-pressed={formatting}
          onClick={() => setFormatting(!formatting)}
        >
          Biçimlendirme araçları
        </button>
      </div>
      {formatting ? (
        <MdEditor
          editorId={inputId + "-editor"}
          modelValue={value || ""}
          onChange={setValue}
          theme={theme}
          language="en-US"
          readOnly={readOnly}
          toolbars={[
            "bold",
            "underline",
            "italic",
            "title",
            "strikeThrough",
            "sub",
            "sup",
            "quote",
            "unorderedList",
            "orderedList",
            "code",
            "link",
            "image",
            "table",
            "mermaid",
            "revoke",
            "next",
            "=",
            "pageFullscreen",
            "fullscreen",
            "preview",
            "catalog",
          ]}
          style={{ height: "min(55vh, 34rem)" }}
        />
      ) : (
        <textarea
          id={inputId}
          rows={8}
          value={value || ""}
          readOnly={readOnly}
          onChange={(event) => setValue(event.target.value)}
        />
      )}
    </div>
  );
}
