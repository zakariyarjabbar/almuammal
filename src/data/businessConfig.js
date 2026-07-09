export const businessConfig = {
  businessNameAr: "مطبعة المؤمل للدعاية والإعلان",
  businessNameEn: "Almuammal Printing & Advertising",
  phone: "TODO_REAL_PHONE",
  whatsapp: "TODO_REAL_WHATSAPP",
  email: "TODO_REAL_EMAIL",
  addressAr: "TODO_REAL_ADDRESS_AR",
  addressEn: "TODO_REAL_ADDRESS_EN",
  workingHoursAr: "TODO_REAL_WORKING_HOURS_AR",
  workingHoursEn: "TODO_REAL_WORKING_HOURS_EN",
  mapEmbedUrl: "TODO_REAL_MAP_EMBED_URL",
  mapExternalUrl: "TODO_REAL_MAP_EXTERNAL_URL",
  social: {
    instagram: "TODO_REAL_INSTAGRAM_URL",
    facebook: "TODO_REAL_FACEBOOK_URL",
    tiktok: "TODO_REAL_TIKTOK_URL",
    youtube: "TODO_REAL_YOUTUBE_URL",
    linkedin: "TODO_REAL_LINKEDIN_URL"
  }
};

export function isConfigured(value) {
  return typeof value === "string" && value.trim() !== "" && !value.startsWith("TODO_");
}
