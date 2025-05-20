export const getDaysBetweenDates = (date1: Date, date2: Date) => {
  const oneDay = 24 * 60 * 60 * 1000;

  const firstDate = new Date(date1);
  const secondDate = new Date(date2);

  return Math.round((secondDate.getTime() - firstDate.getTime()) / oneDay);
};
