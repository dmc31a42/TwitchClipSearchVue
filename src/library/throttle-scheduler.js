import { setInterval } from "core-js";
import PriorityQueue from "js-priority-queue";
import { Observable, of } from "rxjs";
class ThrottleSchedulr {
  priorityQueue = new PriorityQueue({
    comparator: (a, b) => {
      return a.priority - b.priority;
    },
  });

  _Ratelimit_limit = 800;
  _Ratelimit_Remaining = 800;
  _Ratelimit_Reset = Math.floor(new Date().getTime() / 1000);
  get Ratelimit_limit() {
    return this._Ratelimit_limit;
  }
  get Ratelimit_Remaining() {
    return this._Ratelimit_Remaining;
  }
  get Ratelimit_Reset() {
    return this._Ratelimit_Reset;
  }
  get RefreshRatePerSec() {
    return 800 / 60;
  }
  get ThrottleLimit() {
    return 300;
  }

  getObservable(priority) {
    if (this.Ratelimit_Remaining > this.ThrottleLimit) {
      // console.log(`Before) Ratelimit_Remaining--: ${this.Ratelimit_Remaining}`);
      this._Ratelimit_Remaining--;
      // console.log(`After ) Ratelimit_Remaining--: ${this.Ratelimit_Remaining}`);
      this.startUpdate();
      return of(0);
    } else {
      const observ = new Observable((observer) => {
        this.priorityQueue.queue({
          priority: priority,
          subscriber: observer,
        });
      });
      return observ;
    }
  }

  updateRateLimitTimer;
  startUpdate() {
    if (!this.updateRateLimitTimer) {
      const self = this;
      this.updateRateLimitTimer = setInterval(() => {
        if (self.Ratelimit_Remaining >= self.Ratelimit_limit) {
          clearInterval(self.updateRateLimitTimer);
          delete self.updateRateLimitTimer;
          if (self.Ratelimit_Remaining > self.Ratelimit_limit) {
            self.Ratelimit_Remaining = self.Ratelimit_limit;
          }
        } else {
          if (self.priorityQueue.length != 0) {
            console.log(`Ratelimit_Remaining: ${self.Ratelimit_Remaining}`);
            const sub = self.priorityQueue.dequeue();
            sub.subscriber.next(0);
            sub.subscriber.complete();
          } else {
            // console.log(
            //   `Before) Ratelimit_Remaining++: ${self.Ratelimit_Remaining}`
            // );
            self._Ratelimit_Remaining += 1;
            // console.log(
            //   `After ) Ratelimit_Remaining++: ${self.Ratelimit_Remaining}`
            // );
          }
        }
      }, 1000 / this.RefreshRatePerSec);
    }
  }

  setRemainingZero() {
    this.Ratelimit_Remaining = 0;
  }
}

export default ThrottleSchedulr;
