import { Injectable, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { EventService } from 'src/core/event/event.service';
import { WeatherService } from './weather.service';
import { Event } from 'src/core/event/event.model';

@Injectable()
export class NotificationService implements OnModuleInit {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private eventService: EventService,
    private weatherService: WeatherService,
  ) {}
  async onModuleInit() {
    let events = await this.eventService.findAll({});

    for (const event of events) {
      let cronName = `notification for event ${event.id}`;
      await this.addCronJob(cronName, event.time, this.handleCron, event);
    }
  }

  async handleCron(event: Event) {
    let users = await event.$get('users');

    for (const user of users) {
      let city = await user.$get('city');

      let { description, temperature } = await this.weatherService.getWeather(
        city.name,
      );
      await this.weatherService.sendWeather(user.id, description, temperature);
    }
  }

  async addCronJob(
    name: string,
    time: Date,
    task: (params: Event) => Promise<void>,
    params: Event,
  ) {
    let currentTime = new Date().getTime();
    let notificationTime = time.getTime();

    if (currentTime < notificationTime) {
      const cronTime = `0 ${time.getMinutes()} ${time.getHours()} * * *`;

      const job = new CronJob(cronTime, async () => {
        await task(params);
      });

      this.schedulerRegistry.addCronJob(name, job);
      job.start();
    }
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
