export function formatDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('-').map((el) => Number(el));

  const date = new Date();
  date.setFullYear(year, month - 1, day);

  return date;
}

export function compareDateWithCurrent(date: Date) {
  const currentDate = new Date();

  const sameDate =
    currentDate.getDate() === date.getDate() &&
    currentDate.getMonth() === date.getMonth() &&
    currentDate.getFullYear() === date.getFullYear();

  if (sameDate) {
    const currentHour = currentDate.getHours();
    const notificationHour = date.getHours();

    if (currentHour < notificationHour) {
      return true;
    } else if (currentHour === notificationHour) {
      return currentDate.getMinutes() <= date.getMinutes();
    }
  }

  return false;
}

export function formatDateToString(date: Date): string {
  const day = String(date.getDay()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}
