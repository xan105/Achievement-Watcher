import fs from "fs";

export function require(filepath) {
  return JSON.parse(fs.readFileSync(filepath,"utf8"));
}