export const CONTACT_CONFIG = {
  // Primary WhatsApp & direct phone number
  whatsappNumber: "+91 8700735883",
  // Secondary direct line & WhatsApp number
  whatsappNumberSecondary: "+91 9017993302",
  phoneNumbers: ["+91 8700735883", "+91 9017993302"],
  // Fixed text that appears pre-filled in the user's chat input
  defaultWhatsAppMessage: "Hi, I would like to get a quote and timeline for a web project.",
  email: "archdesdigital@gmail.com",
};

/**
 * Returns a direct WhatsApp chat link (wa.me) with phone number and pre-filled message.
 */
export function getWhatsAppUrl(customMessage?: string, phoneNumber?: string): string {
  const target = phoneNumber || CONTACT_CONFIG.whatsappNumber;
  const cleanPhone = target.replace(/[^0-9]/g, "");
  const message = encodeURIComponent(customMessage || CONTACT_CONFIG.defaultWhatsAppMessage);
  return cleanPhone ? `https://wa.me/${cleanPhone}?text=${message}` : `https://wa.me/?text=${message}`;
}
