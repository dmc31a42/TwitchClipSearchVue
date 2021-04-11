import ObservableArray from "observable-array";

class TwitchActivityService {

  _recently = new ObservableArray();
  /**
   * @property {ObservableArray}
   */
  get recently() {
    return this._recently;
  }
  // set recently(value) {
  //   this._recently = value;
  // }
  _favorites = new ObservableArray();
  /**
   * @property {ObservableArray}
   */
  get favorites() {
    return this._favorites;
  }
  // set favorites(value) {
  //   return this._favorites;
  // }

  constructor() {
    const recently = window.localStorage.getItem("recently");
    if(recently) {
      this._recently = new ObservableArray(...JSON.parse(recently));
    }
    const favorites = window.localStorage.getItem("favorites");
    if(favorites) {
      this._favorites = new ObservableArray(...JSON.parse(favorites));
    }
    this._recently.on("change", ()=>{
      window.localStorage.setItem("recently", JSON.stringify(this._recently));
    });
    this._favorites.on("change", ()=>{
      window.localStorage.setItem("favorites", JSON.stringify(this._favorites));
    })
  }
}

export default new TwitchActivityService();