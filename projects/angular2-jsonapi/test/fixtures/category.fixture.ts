export function getSampleCategory(categoryId: string) {
  return {
    id: '' + categoryId,
    type: 'categories',
    attributes: {
      name: 'Category_fiction',
      created_at: '2018-04-02T21:12:41Z',
      updated_at: '2016-04-02T21:12:41Z'
    },
    relationships: {
    },
    links: {
      self: '/v1/categories/1'
    }
  };
}
