export const REQUEST_STEPS = [
  "accepted",
  "preparing",
  "ready",
  "completed",
];

export const REQUEST_COPY = {
  pending: [
    "Waiting for confirmation",
    "The restaurant has received your request.",
  ],
  accepted: ["Confirmed", "Your request was accepted."],
  preparing: ["Preparing", "The kitchen is preparing your order."],
  ready: ["Ready", "Your order is ready to be served."],
  completed: ["Completed", "Enjoy your meal!"],
  cancelled: [
    "Request rejected",
    "Please speak with a staff member or place a new request.",
  ],
};

export const formatMoney = (value) => `$${Number(value).toFixed(2)}`;
