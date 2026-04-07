type TRange = "7d" | "30d" | "12m" | "today";

export const getDateRange = (range?: string) => {
  const now = new Date();
  const endDate = new Date(now);
  const startDate = new Date(now);

  const selectedRange: TRange =
    range === "7d" || range === "30d" || range === "12m" || range === "today"
      ? range
      : "30d";

  if (selectedRange === "today") {
    startDate.setHours(0, 0, 0, 0);
  }

  if (selectedRange === "7d") {
    startDate.setDate(now.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
  }

  if (selectedRange === "30d") {
    startDate.setDate(now.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);
  }

  if (selectedRange === "12m") {
    startDate.setMonth(now.getMonth() - 11);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
  }

  return {
    range: selectedRange,
    startDate,
    endDate,
  };
};

export const getLowStockThreshold = () => 5;