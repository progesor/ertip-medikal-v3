import path from "node:path";
import { execute } from "../src/lib/backup/engine.mjs";
import { archiveFile, kinds } from "../src/lib/backup/storage.mjs";

const [action, value, confirm] = process.argv.slice(2);
if (
  (action === "create" && kinds.includes(value)) ||
  (action === "restore" && value && confirm === "--confirm") ||
  (action === "extract" && value)
) {
  try {
    const result = await execute(
      action,
      action === "create" ? value : path.resolve(value),
    );
    console.log(
      result.id
        ? archiveFile(result.id)
        : result.directory || "Geri yükleme tamamlandı.",
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
} else {
  console.error(
    "create full|sql|media  /  restore <dosya.ertip> --confirm  /  extract <dosya.ertip>",
  );
  process.exitCode = 2;
}
