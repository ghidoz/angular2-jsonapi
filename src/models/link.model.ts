export class LinkModel {
  private _href: string;
  private _name: string;
  //TODO: add meta

  constructor(name: string, link: any) {
    this._name = name;
  }

  name() {
    return this._name;
  }

  href() {
    return this._href;
  }

  /*    meta() {
  return this._meta;
}*/
}
