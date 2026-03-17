export const objectOmitKeys = (object: object, omittedKeys: Set<string>) => {
  return Object.fromEntries(
    Object.entries(object).filter(([key]) => {
      return !omittedKeys.has(key);
    }),
  );
};
