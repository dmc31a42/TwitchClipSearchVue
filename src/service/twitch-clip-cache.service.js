
class TwitchClipCacheService {
  _store = new Object();
  _tempStore = new Object();

  constructor() {
    const store = window.localStorage.getItem("store");
    if (store) {
      this._store = store;
    }
  }

  /**
   * 
   * @param {String | Date} date 
   * @returns 
   */
  dateToStr(date) {
    let tempDate;
    if (typeof date === "string") {
      tempDate = new Date(date);
    } else {
      tempDate = date;
    }
    const currectionDateStr = new Date(
      tempDate.getTime() - new Date().getTimezoneOffset() * 60 * 1000
    ).toISOString();
    return currectionDateStr.slice(0, currectionDateStr.indexOf("T"));
  }

  /**
   *
   * @param {String} userId
   * @param {String | Date} date
   * @param {Array<Object>} clips
   */
  push(userId, date, clips) {
    const dateStr = this.dateToStr(date);
    if (!Object.prototype.hasOwnProperty.call(this._tempStore, userId)) {
      this._tempStore[userId] = new Object();
    }
    this._tempStore[userId][dateStr] = clips;
  }

  /**
   *
   * @param {String} userId
   * @param {String | Date} date
   */
  summit(userId, date) {
    const dateStr = this.dateToStr(date);
    if (!Object.prototype.hasOwnProperty.call(this._store, userId)) {
      this._store[userId] = new Object();
    }
    if (this.hasDateTemp(userId, date)) {
      this._store[userId][dateStr] = this._tempStore[userId][dateStr];
    }
  }

  /**
   *
   * @param {String} userId
   * @param {String | Date} date
   */
  get(userId, date) {
    const dateStr = this.dateToStr(date);
    if (this.hasDate(userId, date)) {
      return this._store[userId][dateStr];
    } else {
      return null;
    }
  }

  /**
   * 
   * @param {String} userId 
   * @param {Date} startDate
   * @param {Date} endDate
   */
  getDurationRange(userId, startDate, endDate) {
    const days = Math.round(
      (endDate.getTime() - startDate.getTime()) /(24*60*60*1000)
    );
    const dates = [];
    for(let i=0; i<days; i++) {
      dates.push(new Date(startDate.getTime()+i*24*60*60*1000));
    }
    return this.getDurationArray(userId, startDate, endDate);
  }

  /**
   * 
   * @param {String} userId 
   * @param {Array<Date>} dates 
   */
  getDurationArray(userId, dates) {
    if(Object.prototype.hasOwnProperty.call(this._store,userId)) {
      return dates.flatMap((value)=> {
        if(this.hasDate(userId, value)) {
          return this.get(userId, value)
        } else {
          return [];
        }
      });
    } else {
      return [];
    }
  }

  /**
   * 
   * @param {String} userId 
   * @param {String | Date} date 
   */
  hasDate(userId, date) {
    return (
      Object.prototype.hasOwnProperty.call(this._store,userId) &&
      Object.prototype.hasOwnProperty.call(this._store[userId],this.dateToStr(date))
    );
  }

  /**
   * 
   * @param {String} userId 
   * @param {String | Date} date 
   */
  hasDateTemp(userId, date) {
    return (
      Object.prototype.hasOwnProperty.call(this._tempStore,userId) &&
      Object.prototype.hasOwnProperty.call(this._tempStore[userId],this.dateToStr(date))
    )
  }

  storeCache() {
    this.storeCacheInternal(this._store);
  }

  /**
   * 
   * @param {Object} store 
   */
  storeCacheInternal(store) {
    setTimeout(()=> {
      try{
        window.localStorage.setItem("store", store);
      } catch (e) {
        if(e.name==="QuotaExceededError" || e.code === 22) {
          const tempStore = {};
          Object.keys(store).forEach((key)=> {
            tempStore[key] = {};
            const dates = Object.keys(store[key]);
            const slicedDates = dates.slice(dates.length/4);
            slicedDates.forEach((date)=> {
              tempStore[key][date] = store[key][date];
            });
          });
          this.storeCacheInternal(tempStore);
        } else {
          throw e;
        }
      }
    },0);
  }

  /**
   * 
   * @param {Object} twitchClip 
   */
  remove(twitchClip) {
    if(Object.prototype.hasOwnProperty.call(this._store,twitchClip.broadcaster_id)) {
      if(
        Object.prototype.hasOwnProperty.call(
          this._store[twitchClip.broadcaster_id],
          this.dateToStr(twitchClip.created_at)
        )
      ) {
        const target = this._store[twitchClip.broadcaster_id][this.dateToStr(twitchClip.created_at)];
        target.splice(target.findIndex((value)=>value.id===twitchClip.id));
        this.storeCache();
      }
    }
  }
}

export default new TwitchClipCacheService();