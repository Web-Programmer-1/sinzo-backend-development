 export const mapSteadfastDeliveryStatusToCourierStatus = (
  deliveryStatus?: string | null
) => {
  const normalized = (deliveryStatus || "").toLowerCase();

  if (
    normalized === "in_review" ||
    normalized === "success" ||
    normalized === "delivered" ||
    normalized === "partial_delivered"
  ) {
    return "SENT";
  }

  if (
    normalized === "cancelled" ||
    normalized === "failed" ||
    normalized === "hold"
  ) {
    return "FAILED";
  }

  return "NOT_SENT";
};