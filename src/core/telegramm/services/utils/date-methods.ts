export function formatDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('-').map((el) => Number(el));

  const date = new Date();
  date.setFullYear(year, month - 1, day);

  return date;
}
