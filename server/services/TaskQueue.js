// server/services/TaskQueue.js
import Queue from 'bull';
import RedisClient from '../utils/RedisClient.js';
import NotificationService from './NotificationService.js';

export default class TaskQueue {
  constructor() {
    this.queues = {
      email: new Queue('email', {
        redis: RedisClient.client.options,
        limiter: {
          max: 100,
          duration: 1000
        }
      }),
      imageProcessing: new Queue('image-processing', {
        redis: RedisClient.client.options,
        concurrency: 2
      })
    };

    this.notificationService = new NotificationService();
    this._registerWorkers();
  }

  _registerWorkers() {
    this.queues.email.process(async job => {
      const { type, data } = job.data;
      switch(type) {
        case 'order-confirmation':
          return this.notificationService.sendOrderConfirmation(data);
        case 'refund-update':
          return this.notificationService.sendRefundNotification(data);
      }
    });

    this.queues.imageProcessing.process(async job => {
      // Image resizing/optimization logic
    });
  }

  addJob(queueName, jobData) {
    return this.queues[queueName].add(jobData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    });
  }
}