import { LinkModel } from './link.model';

export class LinksModel {
    [key: string]: any;

    public updateLinks(links: any) {
        //delete all properties of this object
        Object.keys(this || {}).forEach((name) => {
            console.log(name);
            delete this[name];
        });

        //assign new properties based on whats inside of links
        Object.keys(links || {}).forEach((name) => {
            this[name] = new LinkModel(name, links[name]);
        });
    }

    public links(name: string = null) {
        if(name) {
            return this[name];
        }
        return this;
    }
}
