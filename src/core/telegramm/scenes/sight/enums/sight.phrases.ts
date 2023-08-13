import { SightInfoDto } from '../dto/sight.dto';

export const SightPhrases = {
  start: `Какие достопримечательности хотите найти?`,
  placeQuestion: `Где искать?`,
  undefinedSightType: `Вы не выбрали категорию, пожалуйста вернитесь и сделайти выбор`,
  notFoundSight: `В радиусе 1000 км нет такого типа достопримечательностей, попробуйте выбрать что-то другое`,
  sendError: `Произошла ошибка: `,
  sendSightInfo: (el: SightInfoDto) =>
    `Название: ${el.name}\nАдрес: ${el.address}\nКоординаты: ${el.coordinates}`,
  enterCityName: `Введите название города`,
  undefinedActionType: `Сначала выберите действие`,
  notFoundCity: `Такой город не найден, повторите ввод`,
  cityNameMistake: `В названии города ошибка, пожалуйста попробуйте снова`,
};
