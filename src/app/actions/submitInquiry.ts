"use server";

import { getPayload } from "payload";
import configPromise from "@payload-config";

export async function submitInquiry(formData: FormData) {
  // Formdan gelen verileri alıyoruz
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const message = formData.get("message") as string;

  // Basit validasyon
  if (!name || !email || !message) {
    return { error: "Lütfen zorunlu alanları (Ad, E-Posta, Mesaj) doldurun." };
  }

  try {
    // Payload veritabanına bağlan
    const payload = await getPayload({ config: configPromise });

    // Inquiries koleksiyonuna yeni kayıt oluştur
    await payload.create({
      collection: "inquiries",
      data: {
        name,
        email,
        phone,
        message,
        status: "unread", // Varsayılan olarak okunmadı durumu atıyoruz
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Talep kaydedilemedi:", error);
    return {
      error: "Sistemsel bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
    };
  }
}
