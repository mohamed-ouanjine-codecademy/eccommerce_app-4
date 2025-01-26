// server/services/QueueService.js
class QueueService {
  constructor(name) {
    this.queue = new Bull(name);
  }
  
  async add(jobData) {
    return this.queue.add(jobData);
  }
}

module.exports = QueueService;