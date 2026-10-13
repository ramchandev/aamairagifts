export const WHATSAPP_NUMBER = "917845930488";
export const WHATSAPP_DISPLAY = "+91 78459 30488";
export const CONTACT_EMAIL = "order@aamairagifts.com";

export const OCCASIONS = [
  "Housewarming",
  "Wedding",
  "Navaratri Golu",
  "Baby Shower",
  "Birthday",
  "Festive & Pooja",
  "Corporate",
  "Other",
];

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export function whatsAppHref(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function orderStatusCopy(status: string, needsPricing: boolean, cancelledReason: string | null) {
  switch (status) {
    case "received":
      return needsPricing
        ? "We've received your list. Prices will show on this page once we add them."
        : "We've received your order.";
    case "payment_pending":
      return "Your order is priced and waiting for payment.";
    case "confirmed":
      return "Payment received, we're preparing your order.";
    case "complete":
      return "Your order has been shipped.";
    case "cancelled":
      return cancelledReason ? `This order was cancelled. ${cancelledReason}` : "This order was cancelled.";
    default:
      return "Here's the latest on your order.";
  }
}
