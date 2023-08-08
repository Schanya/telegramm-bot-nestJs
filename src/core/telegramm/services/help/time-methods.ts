import { TimeDto } from '../dto/time.dto';

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
