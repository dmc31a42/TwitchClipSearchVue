class SearchQuery {
  broadcaster_id = [];
  query = [];
  title = [];
  creator_name = [];
  start = null;
  end = null;
  setStart(value) {
    if(
      Object.prototype.toString.call(value) === "[object Date]" &&
      !isNaN(value.getTime())
    ) {
      this.start = value;
    } else if(typeof value === "string") {
      const tempDate = new Date(value);
      if(!isNaN(tempDate.getTime())) {
        if(value.indexOf("T") === -1) {
          tempDate.setHours(0,0,0,0);
        }
        this.start = tempDate;
      }
    }
  }

  setEnd(value) {
    if(
      Object.prototype.toString.call(value) === "[object Date]" &&
      !isNaN(value.getTime())
    ) {
      this.end = value;
    } else if(typeof value === "string") {
      const tempDate = new Date(value);
      if(!isNaN(tempDate.getTime())) {
        if(value.indexOf("T") === -1) {
          tempDate.setHours(23,59,59,999);
        }
        this.end = tempDate;
      }
    }
  }

  constructor({
    broadcaster_id = [],
    query = [],
    title = [],
    creator_name = [],
    start = null,
    end = null,
  } = {}) {
    this.broadcaster_id = broadcaster_id;
    this.query = query;
    this.title = title;
    this.creator_name = creator_name;
    this.start = start;
    this.end = end;
  }

  filter(twitchClip) {
    const bBroadcaster_id = this.broadcaster_id.some(
      (broadcaster_id) => twitchClip.broadcaster_id === broadcaster_id
    );
    const bQuery = this.query.some(
      (query) =>
        twitchClip.title.indexOf(query) !== -1 ||
        twitchClip.creator_name.indexOf(query) !== -1
    );
    let bTitle = false;
    let bCreator_name = false;
    if (!bQuery) {
      if (this.title.length !== 0) {
        bTitle = this.title.some(
          (title) => twitchClip.title.indexOf(title) !== -1
        );
      } else {
        bTitle = true;
      }
      if(this.creator_name.length !== 0) {
        bCreator_name = this.creator_name.some(
          (creator_name) => twitchClip.creator_name.indexOf(creator_name) !== -1
        )
      } else {
        bCreator_name = true;
      }
    } else {
      bTitle = false;
      bCreator_name = false;
    }
    let bStart = true;
    let bEnd = true;
    const time = new Date(twitchClip.created_at).getTime();
    if(this.start) {
      bStart = this.start.getTime() <=time;
    }
    if(this.end) {
      bEnd = time<=this.end.getTime();
    }
    return (
      (bQuery || (this.query.length === 0 && bTitle && bCreator_name)) &&
      bStart &&
      bEnd &&
      bBroadcaster_id
    );
  }

  /**
   * 
   * @param {Object} queries 
   */
  static FromQueries(queries) {
    const searchQuery = new SearchQuery();
    if(Object.prototype.hasOwnProperty.call(queries, "broadcaster_id")) {
      if(typeof queries["broadcaster_id"] === "string") {
        searchQuery.broadcaster_id = [queries["broadcaster_id"]];
      } else {
        searchQuery.broadcaster_id = queries["broadcaster_id"];
      }
    }
    if(Object.prototype.hasOwnProperty.call(queries, "query")) {
      if(typeof queries["query"] === "string") {
        searchQuery.query = [queries["query"]];
      } else {
        searchQuery.query = queries["query"];
      }
    }
    if(Object.prototype.hasOwnProperty.call(queries, "title")) {
      if(typeof queries["title"] === "string") {
        searchQuery.title = [queries["title"]];
      } else {
        searchQuery.title = queries["title"];
      }
    }
    if(Object.prototype.hasOwnProperty.call(queries, "creator_name")) {
      if(typeof queries["creator_name"] === "string") {
        searchQuery.creator_name = [queries["creator_name"]];
      } else {
        searchQuery.creator_name = queries["creator_name"];
      }
    }
    if(Object.prototype.hasOwnProperty.call(queries, "start")) {
      if(typeof queries["start"] === "string") {
        searchQuery.setStart(queries["start"]);
      } else {
        searchQuery.setStart(queries["start"][0]);
      }
    }
    if(Object.prototype.hasOwnProperty.call(queries, "end")) {
      if(typeof queries["end"] === "string") {
        searchQuery.setEnd(queries["end"]);
      } else {
        searchQuery.setEnd(queries["end"][0]);
      }
    }
    return searchQuery;
  }

  get QueryURL() {
    const params = new URLSearchParams();
    this.broadcaster_id.forEach((value)=>{
      params.append("broadcaster_id", value);
    });
    this.query.forEach((value)=>{
      params.append("query", value);
    });
    this.title.forEach((value)=>{
      params.append("title", value);
    });
    this.creator_name.forEach((value)=>{
      params.append("creator_name", value);
    });
    if(this.start) {
      params.append("start", SearchQuery.dateToStr(this.start));      
    }
    if(this.end) {
      params.append("end", SearchQuery.dateToStr(this.end));      
    }
    return params.toString();
  }

  toObject() {
    const obj = new Object();
    if(this.broadcaster_id.length>0) {
      obj.broadcaster_id = this.broadcaster_id.slice();
    }
    if(this.query.length>0) {
      obj.query = this.query.slice();
    }
    if(this.title.length>0) {
      obj.title = this.title.slice();
    }
    if(this.creator_name.length>0) {
      obj.creator_name = this.creator_name.slice();
    }
    if(this.start) {
      obj.start = SearchQuery.dateToStr(this.start);
    }
    if(this.end) {
      obj.end = SearchQuery.dateToStr(this.end);
    }
    return obj;
  }

  /**
   * 
   * @param {Date} date 
   */
  static dateToStr(date) {
    const isoStr = new Date(
      date.getTime() - date.getTimezoneOffset()*60*1000
    ).toISOString();
    return isoStr.slice(0, isoStr.indexOf("T"));
  }
}

export default SearchQuery;