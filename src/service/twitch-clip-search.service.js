import { of } from "rxjs";
import {merge} from "rxjs/index";
import { expand, map, mergeMap, reduce } from "rxjs/operators";
import TwitchApiService from "./twitch-api.service";
import TwitchClipCacheService from "./twitch-clip-cache.service";

class TwitchClipSearchService {
  constructor() {}

  /**
   *
   * @param {String} channelId
   * @param {Date | String} beginDate
   * @param {Date | String} endDate
   * @returns {Observable<Array<Object>>}
   */
  GetClipsAllPage(channelId, beginDate, endDate) {
    const _beginDate = new Date(beginDate);
    const _endDate = new Date(endDate);
    _beginDate.setMinutes(_beginDate.getMinutes() - 10);
    _endDate.setMinutes(_endDate.getMinutes() - 10);

    const arg = {
      broadcaster_id: channelId,
      first: 100,
      started_at: encodeURI(_beginDate.toISOString()),
      ended_at: encodeURI(_endDate.toISOString()),
    };

    return TwitchApiService.GetClips(arg).pipe(
      expand((responseData) => {
        if (responseData.pagination.cursor) {
          return TwitchApiService.GetClips(
            Object.assign({}, arg, {
              after: responseData.pagination.cursor,
            })
          );
        } else {
          return of();
        }
      }),
      reduce((prev, curr) => {
        prev.push(...curr.data);
        return prev;
      }, [])
    );
  }

  /**
   *
   * @param {String} channelId
   * @param {Date} _beginDate
   * @param {Date} _endDate
   */
  GetClipsLongDate(channelId, beginDate, endDate) {
    const _beginDate = new Date(beginDate);
    const _endDate = new Date(endDate);
    _beginDate.setHours(0,0,0);
    _endDate.setHours(23,59,59);

    const dates = Math.floor(new Date(_endDate-_beginDate).getTime()/(24*60*60*1000))+1;
    const found = [];
    const haveToFind = [];
    for(let i=0; i<dates; i++) {
      const tempDate = new Date(_beginDate.getTime()+i*24*60*60*1000);
      if(TwitchClipCacheService.hasDate(channelId, tempDate)) {
        found.push(...TwitchClipCacheService.get(tempDate));
      } else {
        const tempEnd = new Date(tempDate.getTime()+(23*3600+59*60+59)*1000);
        haveToFind.push([tempDate, tempEnd]);
      }
    }
    const haveToFind2 = haveToFind.reduce((prev, curr)=> {
      if(prev.length === 0) {
        prev.push(curr);
        return prev;
      } else {
        if((curr[0]-prev[prev.length-1][1])<=1000) {
          prev[prev.length-1][1] = curr[1];
          return prev;
        } else {
          prev.push(curr);
        }
      }
    }, []);
    let twitchClipsStore = [];
    return merge(of(found),...haveToFind2.map(([begin, end])=>
      this._GetClipsDivRecur(channelId, begin, end)
    )).pipe(
      map((value)=> {
        twitchClipsStore.push(...value);
        twitchClipsStore = twitchClipsStore.filter((v1,index)=>
          twitchClipsStore.findIndex((v2)=> v2.id===v1.id)===index
        )
        return twitchClipsStore;
      })
    );
  }

  /**
   *
   * @param {String} channelId
   * @param {Date} beginDate
   * @param {Date} endDate
   * @returns {Observable<Object>}
   */
  _GetClipsDivRecur(channelId, beginDate, endDate) {
    // const savePoint =
    //   (endDate - beginDate) / 1000 >= 23 * 3600 + 59 * 60 + 59 ? true : false;
    return this.GetClipsAllPage(channelId, beginDate, endDate).pipe(
      mergeMap((twitchClips)=> {
        if(twitchClips.length>900) {
          const middleBeforeDate = new Date((beginDate.getTime()+endDate.getTime())/2);
          const middleAfterDate = new Date(middleBeforeDate.getTime()+1000);
          if(new Date(endDate-beginDate).getTime()/(24*60*60*60)>1) {
            const diffSecond = middleAfterDate.getHours()*3600+middleAfterDate.getMinutes()*60+middleAfterDate.getSeconds();
            middleBeforeDate.setSeconds(middleBeforeDate.getSeconds()-diffSecond);
            middleAfterDate.setSeconds(middleAfterDate.getSeconds()-diffSecond);
          } 
          return merge(
            this._GetClipsDivRecur(channelId, beginDate, middleBeforeDate),
            this._GetClipsDivRecur(channelId, middleAfterDate, endDate)
          ).pipe(
            // reduce((prev, curr)=>{
            //   prev.push(...curr);
            //   return prev;
            // }, []))
          )
        } else {
          return of(twitchClips);
        }
      })
    )
  }
}

export default new TwitchClipSearchService();