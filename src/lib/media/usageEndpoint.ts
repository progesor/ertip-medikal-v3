import type { Endpoint } from "payload";
import { isAdmin } from "@/access/roles";
import { scanImages } from "./usage";

export const mediaUsageEndpoint: Endpoint = {
  path: "/media-usage",
  method: "get",
  handler: async req => {
    if (!isAdmin(req.user)) return Response.json({ message: "Yönetici yetkisi gerekiyor." }, { status: 403 });
    return Response.json({ images: await scanImages(req) }, { headers: { "Cache-Control": "private, no-store" } });
  },
};