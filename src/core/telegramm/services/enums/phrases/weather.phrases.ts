export const WeatherPhrases = {
  start: `Выберите действие`,
  getWeather: `Введите название города, погоду которого хотите знать`,
  getSubscription: `Введите название города, погоду которого хотите знать`,
  getWeatherInfo: (description: string, temperature: number) =>
    `Погода: ${description}\nТемпература: ${temperature}°C`,
  cityNameExeption: `В названии города что-то не так, повторите ввод`,
  sendError: `Произошла ошибка: `,
  undefinedActionType: `Для начала выберите действие`,
  notificationDeleted: (cityName: string, time: string) =>
    `Подписка на город: ${cityName} и  время: ${time})} успешно удалена`,
  unsubscribeNotification: `Вы не подписаны на рассылку`,
};
