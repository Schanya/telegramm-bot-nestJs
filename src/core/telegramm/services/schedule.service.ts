import { Injectable, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { EventService } from 'src/core/event/event.service';
import { WeatherService } from './weather.service';
import { Event } from 'src/core/event/event.model';
import { TimeDto } from './dto/time.dto';
import { Telegraf } from 'telegraf';
import { Context } from '../interfaces/context.interface';
import { InjectBot } from 'nestjs-telegraf';
import axios from 'axios';

@Injectable()
export class NotificationService implements OnModuleInit {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private schedulerRegistry: SchedulerRegistry,
    private eventService: EventService,
    private weatherService: WeatherService,
  ) {}

  compareTimeWithCurrent(date: Date) {
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

  async onModuleInit() {
    let events = await this.eventService.findAll({});

    for (const event of events) {
      let cronName = `notification for event ${event.id}`;
      let time = event.time;

      if (this.compareTimeWithCurrent(time)) {
        await this.addCronJob(cronName, time, this.handleCron, event);
      }
    }
  }

  async handleCron(event: Event) {
    let users = await event.$get('users');

    for (const user of users) {
      let city = await user.$get('city');

      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city.name}&lang=ru&appid=3c3b996343a336616ba97438391b47b4`,
      );

      let description = data['weather'][0].description;
      let temperature = Math.floor(+data['main'].temp - 273.15);

      await this.bot.telegram.sendMessage(
        user.id,
        `Погода: ${description}\nТемпература: ${temperature}°C`,
      );
    }
  }

  async addCronJob(
    name: string,
    time: Date,
    task: (params: Event) => Promise<void>,
    params: Event,
  ) {
    const cronTime = `0 ${time.getMinutes()} ${time.getHours()} * * *`;

    const job = new CronJob(cronTime, async () => {
      await task(params);
    });

    this.schedulerRegistry.addCronJob(name, job);
    job.start();
    this.getCrons();
  }

  getCrons() {
    const jobs = this.schedulerRegistry.getCronJobs();
    jobs.forEach((value, key, map) => {
      let next;
      try {
        next = value.nextDates().toJSDate();
      } catch (e) {
        next = 'error: next fire date is in the past!';
      }
      console.log(`job: ${key} -> next: ${next}`);
    });
  }
}
