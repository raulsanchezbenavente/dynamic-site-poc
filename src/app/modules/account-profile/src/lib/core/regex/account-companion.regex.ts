export const accountCompanionRegex = {
  name: {
    validationPattern: '^[A-Za-z]+$',
    inputPattern: /^[a-zA-ZÀ-ÿ\s'-]*$/,
  },
  lastName: {
    validationPattern: String.raw`^[A-Za-zÀ-ÿ'\- ]+$`,
    inputPattern: /^[a-zA-ZÀ-ÿ\s'-]*$/,
  },
};
