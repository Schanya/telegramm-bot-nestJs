import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

import { CronJob } from 'cron';

@Injectable()
export class NotificationScene {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  async addCronJob<T>(
    name: string,
    time: Date,
    task: (params: Map<T, T>) => Promise<void>,
    params: Map<T, T>,
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
      let next: string;
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
