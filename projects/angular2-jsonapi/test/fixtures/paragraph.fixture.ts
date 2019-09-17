export function getSampleParagraph(paragraphId: string, sectionId: string, content: string = 'Dummy content') {
  return {
    id: paragraphId,
    type: 'paragraphs',
    attributes: {
      content,
      created_at: '2016-10-01T12:54:32Z',
      updated_at: '2016-10-01T12:54:32Z'
    },
    relationships: {
      section: {
        data: {
          id: sectionId,
          type: 'sections'
        }
      },
      firstSentence: {
        data: {
          id: '1',
          type: 'sentences'
        }
      }
    }
  };
}
