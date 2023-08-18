import { TimeDto } from '../time/dto';

export function compareTimeWithCurrent(date: Date) {
  let currentTime: TimeDto = {
    hours: new Date().getHours(),
    minutes: new Date().getMinutes(),
  };

  let notificationTime: TimeDto = {
    hours: date.getHours(),
    minutes: date.getMinutes(),
  };

  return currentTime.hours == notificationTime.hours
    ? currentTime.minutes < notificationTime.minutes
    : currentTime.hours < notificationTime.hours;
}

export function formatTime(currentTime: TimeDto): string {
  return `${String(currentTime.hours).padStart(2, '0')}:${String(
    currentTime.minutes,
  ).padStart(2, '0')}`;
}

export function dateToTimeDto(date: Date): TimeDto {
  return { hours: date.getHours(), minutes: date.getMinutes() };
}
export function parseTime(timeString: string) {
  const [hours, minutes] = timeString.match(/\d+/g).map(Number);
  return { hours, minutes };
}
