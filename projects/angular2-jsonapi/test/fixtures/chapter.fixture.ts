export function getSampleChapter(
  i: number, chapterId: string,
  chapterTitle: string = 'Dummy title',
  related?: string[],
  relatesTo?: string
) {
  const response: any = {
    id: chapterId,
    type: 'chapters',
    attributes: {
      title: chapterTitle,
      ordering: parseInt(chapterId, 10),
      created_at: '2016-10-01T12:54:32Z',
      updated_at: '2016-10-01T12:54:32Z'
    },
    relationships: {
      book: {
        links: {
          self: '/v1/authors/288/relationships/book',
          related: '/v1/authors/288/book'
        },
        data: {
          id: '' + i,
          type: 'books'
        }
      },
      firstSection: {
        data: {
          id: '1',
          type: 'sections'
        }
      }
    },
    links: {
      self: '/v1/authors/288'
    }
  };
  if (related) {
    response.relationships.related = {
      data: related.map(id => ({id, type: 'chapters'})),
    };
  }
  if (relatesTo) {
    response.relationships.relatesTo = {
      data: {id: relatesTo, type: 'chapters'}
    };
  }
  return response;
}
