import { Context } from 'telegraf';

import { City } from '@city/city.model';
import { Event } from '@event/event.model';

import { EventType } from '@event/types';

import { UserService } from '@user/user.service';

export async function getUserEvent(
  telegrammID: number,
  userService: UserService,
): Promise<Event> {
  const user = await userService.findBy({ telegrammID });

  if (user) {
    const events = await user.$get('events', { type: 'weather' });
    const event = events[0];

    return event;
  }
}

export async function getUserCity(
  telegrammID: number,
  userService: UserService,
): Promise<City> {
  const user = await userService.findBy({ telegrammID });

  if (user) {
    const city = await user.$get('city');

    return city;
  }
}

export async function saveUser(ctx: Context, userService: UserService) {
  const previousSceneData = JSON.parse(ctx.state.previousSceneData);

  const cityInfo = { name: previousSceneData.cityName };

  const { first_name: name, id: telegrammID } = ctx.callbackQuery.from;
  const userInfo = { name, telegrammID };

  const { time } = previousSceneData;
  const type: EventType = 'weather';
  const eventInfo = {
    time: new Date(0, 0, 0, time.hours, time.minutes),
    type,
  };

  const userData = { cityInfo, eventInfo, userInfo };

  const response = await userService.saveUserWithData(userData);

  return response;
}
