/**
 * Format game name by replacing underscores with spaces
 */
export const formatGameName = (name: string): string => {
  return name.replace(/_/g, ' ');
};
