import { getDaysBetweenDates } from '@/shared/lib/get-days-between-dates';

export enum Types {
  warning = 'warning',
  alert = 'alert',
}

export const getType = (sowftwareEndDate: string): Types | undefined => {
  const daysBetween = getDaysBetweenDates(
    new Date(),
    new Date(Date.parse(sowftwareEndDate)),
  );
  if (daysBetween < 0) {
    return Types.alert;
  } else if (daysBetween <= 14) {
    return Types.warning;
  }
  return undefined;
};
