export const getTrackingId = () => {
  return `TRK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};
