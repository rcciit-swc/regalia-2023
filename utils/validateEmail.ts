import { regexHelpers } from "./regexHelpers";

export const validateEmail = (email: string): RegExpMatchArray | null => {
  return email.match(regexHelpers.EMAIL_REGEX);
};
