import type { Endpoint } from "payload";
import { isContentManager } from "@/access/roles";
import { isSiteLocale, type SiteLocale } from "@/lib/i18n/config";
import {
  readUiTextOverrides,
  writeUiTextOverrides,
} from "@/lib/i18n/uiTextOverrideStore";

type UiTextRequestBody = {
  action?: "load" | "save";
  locale?: SiteLocale;
  data?: unknown;
};

function forbiddenResponse() {
  return Response.json(
    { message: "Bu işlem yalnızca içerik yöneticileri tarafından kullanılabilir." },
    { status: 403 },
  );
}

export const uiTextOverrideEndpoint: Endpoint = {
  path: "/i18n/ui-text-overrides",
  method: "post",
  handler: async (req) => {
    if (!isContentManager(req.user)) return forbiddenResponse();

    const body = (
      typeof req.json === "function"
        ? await req.json().catch(() => ({}))
        : {}
    ) as UiTextRequestBody;
    const locale = body.locale;

    if (!locale || !isSiteLocale(locale)) {
      return Response.json({ message: "Geçerli bir dil seçilmedi." }, { status: 400 });
    }

    if (body.action === "load") {
      const data = await readUiTextOverrides(locale);
      return Response.json({ success: true, locale, data });
    }

    if (body.action === "save") {
      const data = await writeUiTextOverrides({
        locale,
        data: body.data,
        userId: req.user?.id,
      });

      req.payload.logger.info({
        msg: "Localized public UI text overrides updated.",
        locale,
        keyCount: Object.keys(data).length,
        userId: req.user?.id,
      });

      return Response.json({
        success: true,
        locale,
        data,
        message:
          Object.keys(data).length > 0
            ? "UI metinleri kaydedildi. Boş bırakılan alanlarda sistem varsayılanları kullanılacak."
            : "Tüm özel UI metinleri temizlendi. Sistem varsayılanları kullanılacak.",
      });
    }

    return Response.json({ message: "Geçersiz işlem." }, { status: 400 });
  },
};
