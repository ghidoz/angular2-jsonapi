export class LinkModel {
  private _name: string;
  private _href: string;
  // TODO: add meta

  constructor(name: string, link: any) {
    this._name = name;
    this._href = link;
  }

  get name(): string {
    return this._name;
  }

  get href(): string {
    return this._href;
  }
}
