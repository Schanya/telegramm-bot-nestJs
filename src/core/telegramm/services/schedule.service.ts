import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { WeatherDto } from './dto/weather.dto';

@Injectable()
export class NotificationService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  async addCronJob(
    name: string,
    time: Date,
    task: (params: Map<number, WeatherDto>) => Promise<void>,
    params: Map<number, WeatherDto>,
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
    return jobs.keys();
  }

  deleteCron(cronName: string) {
    const doesExistCron = this.schedulerRegistry.doesExist('cron', cronName);

    if (doesExistCron) {
      this.schedulerRegistry.deleteCronJob(cronName);
    }
  }
}
