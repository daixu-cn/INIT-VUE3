import type { Plugin } from "vite"

import { exec } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

export default function (): Plugin {
  return {
    name: "create-version",
    buildStart() {
      exec("git log -1 --pretty=format:'%H %cd' --date=iso-strict", (err, stdout) => {
        fs.writeFile(
          path.join(import.meta.dirname, "../../public/version.json"),
          JSON.stringify({ version: stdout.trim() }),
          "utf8",
          () => {},
        )
      })
    },
  }
}
