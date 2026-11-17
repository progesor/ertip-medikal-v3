const api = "/api/site-backups";

async function send(options: RequestInit, retry = false) {
  for (let attempt = 0; ; attempt++) {
    let response: Response | undefined;
    try {
      response = await fetch(api, {
        ...options,
        headers: { "x-ertip-backup": "1", ...options.headers },
      });
    } catch {
      if (!retry || attempt >= 3)
        throw Error(
          "Yükleme sırasında bağlantı kesildi. Dosyayı tekrar seçin.",
        );
    }
    if (response?.ok) {
      const result = await response.json().catch(() => null);
      if (!result)
        throw Error(
          "Sunucu beklenmeyen bir yanıt verdi. Yönetici oturumunu kontrol edin.",
        );
      return result;
    }
    if (
      response &&
      (!retry ||
        attempt >= 3 ||
        ![408, 409, 429, 502, 503, 504, 520, 522, 524].includes(
          response.status,
        ))
    ) {
      const info = await response.json().catch(() => null);
      const fallback =
        response.status === 413
          ? "Sunucu yüklenen parçanın boyutunu reddetti."
          : response.status === 401
            ? "Yönetici oturumu sona erdi."
            : "Sunucu isteği tamamlayamadı.";
      throw Error(
        info?.message || fallback + " (HTTP " + response.status + ")",
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 600 * 2 ** attempt));
  }
}
export function backupAction(body: object, retry = false) {
  return send(
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    retry,
  );
}
export async function uploadBackup(
  file: File,
  progress: (percent: number) => void,
) {
  const { id, chunkSize } = await backupAction({
    action: "beginUpload",
    size: file.size,
  });
  if (!id || !Number.isSafeInteger(chunkSize) || chunkSize <= 0)
    throw Error("Yükleme başlatılamadı.");
  for (let offset = 0; offset < file.size; offset += chunkSize) {
    const end = Math.min(offset + chunkSize, file.size);
    const part = await send(
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream",
          "x-upload-id": id,
          "x-upload-offset": String(offset),
        },
        body: file.slice(offset, end),
      },
      true,
    );
    if (part.received !== end)
      throw Error("Sunucu parçanın kaydedildiğini doğrulayamadı.");
    progress(Math.floor((end / file.size) * 100));
  }
  await backupAction({ action: "finishUpload", id }, true);
}
