export function formatDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('-').map((el) => Number(el));

  const date = new Date();
  date.setFullYear(year, month - 1, day);

  return date;
}

export function compareDateWithCurrent(date: Date) {
  const currentDate = new Date();

  const currentDateObj = {
    day: currentDate.getDay(),
    month: currentDate.getMonth(),
    yaer: currentDate.getFullYear(),
    hours: currentDate.getHours(),
    minutes: currentDate.getMinutes(),
  };

  const notificationDateObj = {
    day: date.getDay(),
    month: date.getMonth(),
    yaer: date.getFullYear(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
  };

  return (
    currentDateObj.day == notificationDateObj.day &&
    currentDateObj.month == notificationDateObj.month &&
    currentDateObj.yaer == notificationDateObj.yaer &&
    currentDateObj.hours <= notificationDateObj.hours &&
    currentDateObj.minutes <= notificationDateObj.minutes
  );
}
