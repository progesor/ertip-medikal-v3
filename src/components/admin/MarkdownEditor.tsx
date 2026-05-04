"use client";

import React, { useState } from "react";
import { MdEditor, NormalToolbar } from "md-editor-rt"; // NormalToolbar eklendi
import "md-editor-rt/lib/style.css";
import { useField } from "@payloadcms/ui";
import { Label } from "@/components/ui/label";

export const MarkdownEditor: React.FC<{ path: string; label: string }> = ({
  path,
  label,
}) => {
  const { value, setValue } = useField<string>({ path });

  // Tema state'ini oluşturuyoruz (Varsayılan: light)
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Tema değiştirme fonksiyonu
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="field-type code" style={{ marginBottom: "20px" }}>
      <Label>{label}</Label>
      <div
        style={{
          marginTop: "10px",
          borderRadius: "var(--radius, 12px)",
          overflow: "hidden",
          border: "1px solid var(--theme-elevation-150)",
        }}
      >
        <MdEditor
          modelValue={value || ""}
          onChange={(val) => setValue(val)}
          language="en-US"
          theme={theme} // Dinamik tema
          toolbars={[
            "bold",
            "underline",
            "italic",
            "-",
            "title",
            "strikeThrough",
            "sub",
            "sup",
            "quote",
            "unorderedList",
            "orderedList",
            "-",
            "code",
            "link",
            "image",
            "table",
            "mermaid",
            "-",
            "revoke",
            "next",
            "=",
            0, // Özel toolbar elementimizin (Dark Mode butonu) index'i
            "pageFullscreen",
            "fullscreen",
            "preview",
            "catalog",
          ]}
          // Özel (Custom) Toolbar tanımlamaları
          defToolbars={[
            <NormalToolbar
              key="theme-toggle"
              title={
                theme === "light" ? "Karanlık Moda Geç" : "Aydınlık Moda Geç"
              }
              onClick={toggleTheme}
            >
              <div
                style={{
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {theme === "light" ? "🌙" : "☀️"}
              </div>
            </NormalToolbar>,
          ]}
          style={{ height: "600px" }}
        />
      </div>
    </div>
  );
};
