const fs = require("fs-extra");

const directoriesToCopy = [
  // { source: "uploads", destination: "dist/uploads" },
  { source: "src/public", destination: "dist/public" },
];

async function copyDirectories() {
  try {
    for (const directory of directoriesToCopy) {
      await fs.copy(directory.source, directory.destination);
    }
    console.log("Successfully Duplicated!");
  } catch (error) {
    console.error("Error, extra:", error);
  }
}

copyDirectories().then();
