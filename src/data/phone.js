export const COUNTRY_CODES = ["+374", "+1", "+7", "+33", "+44", "+49"];
export const DEFAULT_COUNTRY_CODE = "+374";

export const normalizePhoneDigits = (value) =>
  String(value || "").replace(/\D/g, "").slice(0, 15);

export const normalizeLocalPhoneDigits = (countryCode, value) =>
  normalizePhoneDigits(value).slice(0, 15 - countryCode.replace(/\D/g, "").length);

export const splitPhoneNumber = (value) => {
  const digits = normalizePhoneDigits(value);
  const matchedCountryCode = COUNTRY_CODES.find((code) =>
    digits.startsWith(code.slice(1))
  );

  if (!matchedCountryCode) {
    return { countryCode: DEFAULT_COUNTRY_CODE, localNumber: digits };
  }

  return {
    countryCode: matchedCountryCode,
    localNumber: digits.slice(matchedCountryCode.length - 1),
  };
};

export const formatPhoneNumber = (countryCode, localNumber) =>
  `${countryCode}${normalizeLocalPhoneDigits(countryCode, localNumber)}`;