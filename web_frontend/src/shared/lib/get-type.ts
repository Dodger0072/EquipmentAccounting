import { getDaysBetweenDates } from '@/shared/lib/get-days-between-dates';

export enum Types {
  warning = 'warning',
  alert = 'alert',
}

export const getType = (softwareEndDate: string): Types | undefined => {
  const daysBetween = getDaysBetweenDates(
    new Date(),
    new Date(Date.parse(softwareEndDate)),
  );
  if (daysBetween < 0) {
    return Types.alert;
  } else if (daysBetween <= 14) {
    return Types.warning;
  }
  return undefined;
};
