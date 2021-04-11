import axios from "axios";
import { ArgumentOutOfRangeError, throwError } from "rxjs";
import { catchError, delay, map, mergeMap, retryWhen, take, tap } from "rxjs/operators";
import { of } from "rxjs/index";
import ThrottleSchedulr from "../library/throttle-scheduler";

class TwitchApiService {
  _throttleScheduler = new ThrottleSchedulr();
  _access_token;
  _validated = false;
  get access_token() {
    return this._access_token;
  }
  set access_token(value) {
    if (value) {
      if (this._access_token != value) {
        this._validated = false;
      }
      this._access_token = value;
      this.access_token_localStorage = value;
    }
  }
  // set access_token_cookie(value) {
  //     document.cookie = `twitch-access_token=${value}`;
  // }
  // get access_token_cookie() {
  //     return /twitch-access_token=(.+)[^;]/.exec(document.cookie)?.[1]??""
  // }
  get access_token_localStorage() {
    return window.localStorage.getItem("twitch-access_token");
  }
  set access_token_localStorage(value) {
    window.localStorage.setItem("twitch-access_token", value);
  }
  get PublicHttpHeader() {
    if (this.access_token) {
      return {
        Authorization: `Bearer ${this.access_token}`,
        "Client-ID": process.env.VUE_APP_TWITCH_CLIENT_ID,
      };
    } else {
      return {
        "Client-ID": process.env.VUE_APP_TWITCH_CLIENT_ID,
      };
    }
  }

  constructor() {
    const access_token_localStorage = this.access_token_localStorage;
    if (access_token_localStorage) {
      this.access_token = access_token_localStorage;
    }
  }

  Logout() {
    this._access_token = null;
    this._validated = false;
    window.localStorage.removeItem("twitch-access_token");
  }

  /**
   *
   * @param {String} client_id
   * @param {String} redirect_uri
   * @param {String} response_type
   * @param {Array<String>} scopes
   * @param {Boolean} force_verify
   * @param {String} state
   */
  GetOAuthURL(
    client_id = process.env.VUE_APP_TWITCH_CLIENT_ID,
    redirect_uri = process.env.VUE_APP_TWITCH_OAUTH_REDIRECT_URL,
    response_type = "token",
    scopes = [],
    force_verify = false,
    state
  ) {
    const OAUTH_URL = "https://id.twitch.tv/oauth2/authorize";
    const params = new URLSearchParams();
    params.append("client_id", client_id);
    params.append("redirect_uri", redirect_uri);
    params.append("response_type", response_type);
    params.append("scope", scopes.join("+"));
    if (force_verify === true) {
      params.append("force_verify", "true");
    }
    if (state) {
      params.append("state", state);
    }
    return `${OAUTH_URL}?${params.toString()}`;
  }

  /**
   *
   * @returns {Observable<Boolean>}
   */
  get IsValidate() {
    if (this._validated && this.access_token) {
      return of(true);
    } else {
      if (this.access_token) {
        return this.GetUsers().pipe(
          catchError((err) => {
            if (err.response.status === 401) {
              return of(false);
            } else {
              throw err;
            }
          }),
          map((value) => (value ? true : false)),
          tap((value) => (this._validated = value)),
          tap((value) => {
            if (value === false) {
              this.access_token_cookie = "";
            }
          })
        );
      } else {
        return of(false);
      }
    }
  }

  /**
   *
   * @param {Array<String> | undefined} id
   * @param {Array<String> | undefined} login
   */
  GetUsers(id, login) {
    const GET_USERS_URL = "https://api.twitch.tv/helix/users";
    if ((id?.length ?? 0) + (login?.length ?? 0) > 100) {
      return new throwError(new ArgumentOutOfRangeError());
    }
    const params = new URLSearchParams();
    id?.forEach((value) => {
      params.append("id", value);
    });
    login?.forEach((value) => {
      params.append("login", value);
    });
    return this._throttleScheduler.getObservable(0).pipe(
      mergeMap(() =>
        axios.get(GET_USERS_URL, {
          headers: this.PublicHttpHeader,
          params: params,
        })
      ),
      map((value) => value.data.data)
    );
  }

  /**
   * 
   * @param {Object} param0 
   * @returns {Observable<Object>}
   */
  GetClips({
    broadcaster_id = [],
    game_id = [],
    id = [],
    after ="",
    before = "",
    ended_at = "",
    first = 20,
    started_at = "",
  } = {}) {
    let _broadcaster_id;
    if (typeof broadcaster_id === "object") {
      _broadcaster_id = broadcaster_id;
    } else if (
      typeof broadcaster_id === "string" ||
      typeof broadcaster_id === "number"
    ) {
      _broadcaster_id = [broadcaster_id.toString()];
    }
    let _game_id;
    if (typeof game_id === "object") {
      _game_id = game_id;
    } else if (typeof game_id === "string" || typeof game_id === "number") {
      _game_id = [game_id.toString()];
    }
    let _id;
    if (typeof id === "object") {
      _id = id;
    } else if (typeof id === "string" || typeof id === "number") {
      _id = [id.toString()];
    }
    if (
      (_broadcaster_id?.length ?? 0) +
        (_game_id?.length ?? 0) +
        (_id?.length ?? 0) >
      first
    ) {
      return new throwError(new ArgumentOutOfRangeError());
    }
    const params = new URLSearchParams();
    _broadcaster_id?.forEach((value) => {
      params.append("broadcaster_id", value);
    });
    _game_id?.forEach((value) => {
      params.append("game_id", value);
    });
    _id?.forEach((value) => {
      params.append("id", value);
    });
    if (after) {
      params.append("after", after);
    }
    if (before) {
      params.append("before", before);
    }
    if (ended_at) {
      if (typeof ended_at === "string") {
        params.append("ended_at", encodeURI(ended_at));
      } else {
        params.append("ended_at", encodeURI(ended_at.toISOString()));
      }
    }
    if (first) {
      params.append("first", first);
    }
    if (started_at) {
      if (typeof started_at === "string") {
        params.append("started_at", encodeURI(started_at));
      } else {
        params.append("started_at", encodeURI(started_at.toISOString()));
      }
    }

    return this._throttleScheduler
      .getObservable(new Date(started_at).getTime())
      .pipe(
        mergeMap(() =>
          axios.get(`https://api.twitch.tv/helix/clips`, {
            headers: this.PublicHttpHeader,
            params: params,
          })
        ),
        tap((response) => {
          if (Object.prototype.hasOwnProperty.call(response.headers,"ratelimit-remaining")) {
            // console.log(response.headers["ratelimit-remaining"]);
          }
        }),
        map((response) => response.data),
        retryWhen((errors)=> errors.pipe(delay(100), take(5)))
      );
  }

  SearchChannels(query, first=20, after="", live_only=false) {
    if(!query) {
      return of([]);
    } else {
      const params = new URLSearchParams();
      params.append("query", query);
      params.append("first", first<0?20:first>100?100:first);
      if(after) {
        params.append("after", after);
      }
      if(live_only) {
        params.append("live_only", live_only);
      }
      return this._throttleScheduler
      .getObservable(0)
      .pipe(
        mergeMap(()=>
          axios.get(`https://api.twitch.tv/helix/search/channels`,{
            headers: this.PublicHttpHeader,
            params: params,
          })
        ),
        map((response)=> response.data.data),
        retryWhen((errors)=> errors.pipe(delay(100,), take(5)))
      );
    }
  }

}

export default new TwitchApiService();
