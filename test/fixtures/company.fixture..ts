import {COMPANY} from "./author.fixture";

export function getSampleBook(i: number, authorId: string) {
    return {
        'id': '' + i,
        'type': 'company',
        'attributes': {
            'title': COMPANY
        },
        'links': {
            'self': '/v1/company/1'
        }
    }
}