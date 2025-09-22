import { customAlphabet } from "nanoid";

export const generatePackageID = () => {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nanoid = customAlphabet(alphabet, 6);

  return `PKG-${nanoid()}`;
};

export const generateCartID = () => {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nanoid = customAlphabet(alphabet, 10);

  return `CRT-${nanoid()}`;
};
