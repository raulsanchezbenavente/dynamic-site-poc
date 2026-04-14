export const accountPersonalRegex = {
  city: {
    validationPattern: "^(?! )[A-Za-zÀ-ÿ]+(?:[ '-][A-Za-zÀ-ÿ]+)*(?<! )$",
    inputPattern: /^[a-zA-ZÀ-ÿ\s'-]*$/,
  },
  address: {
    validationPattern: '^[A-Za-z0-9 .,#-]+$',
  },
};
