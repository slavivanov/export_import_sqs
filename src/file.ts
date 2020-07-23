import fs from "fs";

export const removeFile = (path: string) => {
  fs.unlinkSync(path);
};

export const appendToJSONFile = (path: string, content: string) => {
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, "[");
    return fs.appendFileSync(path, content);
  }
  return fs.appendFileSync(path, `,${content}`);
};

export const closeJSONFile = (path: string) => {
  return fs.appendFileSync(path, `]`);
};

export const readJSONFile = (path: string) => {
  const contents = fs.readFileSync(path, "utf8");
  return JSON.parse(contents);
};
