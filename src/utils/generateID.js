import { customAlphabet } from "nanoid";

export const generatePackageID = () => {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nanoid = customAlphabet(alphabet, 6);

  return `PKG-${nanoid()}`;
};
