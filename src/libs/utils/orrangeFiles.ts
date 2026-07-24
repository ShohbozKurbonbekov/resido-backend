export const arrangeFiles = (files: Express.Multer.File[]): string[] => {
  return files.map((file) => file.path.replace(/\\/g, "/"));
};
