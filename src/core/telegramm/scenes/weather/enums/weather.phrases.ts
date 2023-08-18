export const WeatherPhrases = {
  start: `Выберите действие`,
  getWeather: `Введите название города, погоду которого хотите знать`,
  getSubscription: `Введите название города, погоду которого хотите знать`,
  getWeatherInfo: (
    cityName: string,
    description: string,
    temperature: number,
  ) => `г. ${cityName}\nПогода: ${description}\nТемпература: ${temperature}°C`,
  cityNameExeption: `В названии города что-то не так, повторите ввод`,
  sendError: `Что-то не так, повторите запрос позже`,
  undefinedActionType: `Для начала выберите действие`,
  notificationDeleted: (cityName: string, time: string) =>
    `Подписка успешно удалена: \nГород: ${cityName} \nВремя: ${time} `,
  unsubscribeNotification: `Вы не подписаны на рассылку`,
  notificationSet: (notificationTime: string) =>
    `Напоминание установлено на ${notificationTime}`,
  subscriptionExeption: (cityName: string, time: string) =>
    `Вы уже подписаны на рассылку:\n Город: ${cityName} \n Время: ${time}`,
  menu: 'Главное меню',
};
