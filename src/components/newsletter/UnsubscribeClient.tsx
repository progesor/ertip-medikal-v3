"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  MailCheck,
  MailX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getHomePath } from "@/lib/i18n/routing";
import {
  useSiteLocale,
  useUiDictionary,
} from "@/providers/SiteLocaleProvider";

type Status = "idle" | "loading" | "success" | "error";

export function UnsubscribeClient({ token }: { token?: string }) {
  const locale = useSiteLocale();
  const dictionary = useUiDictionary();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/public/unsubscribe/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          website: formData.get("website"),
        }),
      });

      if (!response.ok) {
        setStatus("error");
        setMessage(dictionary.unsubscribe.requestError);
        return;
      }

      setStatus("success");
      setMessage(dictionary.unsubscribe.requestSuccess);
      form.reset();
    } catch {
      setStatus("error");
      setMessage(dictionary.unsubscribe.connectionError);
    }
  };

  const handleConfirm = async () => {
    if (!token) return;

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/public/unsubscribe/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        setStatus("error");
        setMessage(dictionary.unsubscribe.confirmationError);
        return;
      }

      setStatus("success");
      setMessage(dictionary.unsubscribe.confirmationSuccess);
    } catch {
      setStatus("error");
      setMessage(dictionary.unsubscribe.connectionError);
    }
  };

  const isConfirmation = Boolean(token);
  const isComplete = status === "success";

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-surface-muted/30 px-4 py-20">
      <div className="max-w-md w-full bg-surface p-8 md:p-12 rounded-[var(--radius-3xl)] shadow-2xl shadow-surface-inverse/5 border border-border/80 text-center">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isComplete ? "bg-success/10" : "bg-surface-muted"
          }`}
        >
          {isComplete ? (
            <CheckCircle2 className="w-10 h-10 text-success" />
          ) : isConfirmation ? (
            <MailCheck className="w-10 h-10 text-text-muted" />
          ) : (
            <MailX className="w-10 h-10 text-text-muted" />
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-text-main mb-4">
          {isComplete
            ? isConfirmation
              ? dictionary.unsubscribe.cancelledTitle
              : dictionary.unsubscribe.checkEmailTitle
            : isConfirmation
              ? dictionary.unsubscribe.confirmationTitle
              : dictionary.unsubscribe.title}
        </h1>

        {message ? (
          <div
            className={`mb-6 rounded-xl border p-4 text-sm font-medium ${
              status === "error"
                ? "border-error/25 bg-error/10 text-error"
                : "border-success/25 bg-success/10 text-text-main"
            }`}
          >
            {status === "error" ? (
              <AlertCircle className="inline-block w-4 h-4 mr-2" />
            ) : null}
            {message}
          </div>
        ) : (
          <p className="text-text-muted mb-8 leading-relaxed">
            {isConfirmation
              ? dictionary.unsubscribe.confirmationDescription
              : dictionary.unsubscribe.requestDescription}
          </p>
        )}

        {!isComplete && isConfirmation ? (
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={status === "loading"}
            className="w-full h-14 rounded-[var(--radius-xl)] font-bold"
          >
            {status === "loading"
              ? dictionary.common.processing
              : dictionary.unsubscribe.cancelSubscription}
          </Button>
        ) : null}

        {!isComplete && !isConfirmation ? (
          <form onSubmit={handleRequest} className="space-y-4">
            <div
              aria-hidden="true"
              className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
            >
              <label htmlFor="unsubscribe-website">Website</label>
              <input
                id="unsubscribe-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder={dictionary.unsubscribe.emailPlaceholder}
              className="w-full px-4 py-3 rounded-[var(--radius)] border border-input bg-background focus:border-primary focus:ring-2 focus:ring-ring/30 outline-none transition-all text-text-main placeholder:text-text-muted/50"
            />
            <Button
              type="submit"
              variant="destructive"
              disabled={status === "loading"}
              className="w-full h-14 rounded-[var(--radius-xl)] font-bold"
            >
              {status === "loading"
                ? dictionary.common.sending
                : dictionary.unsubscribe.sendLink}
            </Button>
          </form>
        ) : null}

        <Link
          href={getHomePath(locale)}
          className="inline-flex items-center justify-center mt-6 text-sm font-semibold text-text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {dictionary.unsubscribe.backHome}
        </Link>
      </div>
    </div>
  );
}
