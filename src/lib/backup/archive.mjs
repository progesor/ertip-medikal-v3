import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  hkdfSync,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { createWriteStream } from "node:fs";
import { open } from "node:fs/promises";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import * as tar from "tar";
import { kinds } from "./storage.mjs";

// Authenticated header, encrypted tar.gz, then HMAC-SHA256 over header and ciphertext.
// Each archive has independent encryption and authentication keys.
const magic = Buffer.from("ERTIPBK1");
const headerSize = magic.length + 1 + 16;
function keys(header) {
  const secret = process.env.PAYLOAD_SECRET?.trim();
  if (!secret || secret.length < 32)
    throw Error("PAYLOAD_SECRET ayarını kontrol edin.");
  const salt = header.subarray(magic.length + 1);
  const derive = (purpose) =>
    hkdfSync("sha256", secret, salt, "ertip-backup-v1/" + purpose, 32);
  return {
    key: derive("encryption"),
    mac: createHmac("sha256", derive("authentication")).update(header),
  };
}
function authenticate(mac) {
  return new Transform({
    transform(chunk, _, cb) {
      mac.update(chunk);
      cb(null, chunk);
    },
  });
}
export async function pack(directory, kind, target) {
  const header = Buffer.concat([
    magic,
    Buffer.from([kinds.indexOf(kind)]),
    randomBytes(16),
  ]);
  const { key, mac } = keys(header);
  const entries = ["manifest.json"];
  if (kind !== "media") entries.push("database.sql");
  if (kind !== "sql") entries.push("media");
  const handle = await open(target, "wx", 0o600);
  try {
    await handle.writeFile(header);
    await pipeline(
      tar.c(
        { cwd: directory, gzip: true, portable: true, strict: true },
        entries,
      ),
      createCipheriv("aes-256-ctr", key, Buffer.alloc(16)),
      authenticate(mac),
      createWriteStream(target, { flags: "a" }),
    );
    await handle.write(mac.digest(), 0, 32, (await handle.stat()).size);
  } finally {
    await handle.close();
  }
}

export async function unpack(source, directory, tempTar) {
  const invalid = () =>
    Error(
      "Paket doğrulanamadı. Dosyayı ve kaynak sunucudaki PAYLOAD_SECRET değerini kontrol edin.",
    );
  const handle = await open(source, "r");
  let kind;
  try {
    const { size } = await handle.stat();
    if (size <= headerSize + 32) throw invalid();
    const header = Buffer.alloc(headerSize);
    await handle.read(header, 0, header.length, 0);
    kind = kinds[header[magic.length]];
    if (!header.subarray(0, magic.length).equals(magic) || !kind)
      throw invalid();
    const signature = Buffer.alloc(32);
    await handle.read(signature, 0, 32, size - 32);
    const { key, mac } = keys(header);
    await pipeline(
      handle.createReadStream({
        start: headerSize,
        end: size - 33,
        autoClose: false,
      }),
      authenticate(mac),
      createDecipheriv("aes-256-ctr", key, Buffer.alloc(16)),
      createWriteStream(tempTar, { flags: "wx", mode: 0o600 }),
    );
    if (!timingSafeEqual(mac.digest(), signature)) throw invalid();
  } finally {
    await handle.close();
  }

  let rejectedEntry = false;
  const filter = (name, entry) => {
    const parts = name.replace(/\/$/, "").split("/");
    const allowed =
      ["File", "Directory"].includes(entry.type) &&
      parts.every(
        (part) =>
          part && part !== "." && part !== ".." && !/[\\:\x00-\x1f]/.test(part),
      ) &&
      ((parts[0] === "media" && kind !== "sql") ||
        (parts.length === 1 &&
          (name === "manifest.json" ||
            (name === "database.sql" && kind !== "media"))));
    if (!allowed) rejectedEntry = true;
    return Boolean(allowed);
  };
  await tar.x({
    file: tempTar,
    cwd: directory,
    strict: true,
    preserveOwner: false,
    filter,
  });
  if (rejectedEntry) throw Error("Paket desteklenmeyen bir dosya içeriyor.");
  return kind;
}
