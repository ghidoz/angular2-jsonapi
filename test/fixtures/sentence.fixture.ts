export function getSampleSentence(sentenceId: string, paragraphId: string, content: string = 'Dummy content') {
  return {
    id: sentenceId,
    type: 'sentences',
    attributes: {
      content,
      created_at: '2016-10-01T12:54:32Z',
      updated_at: '2016-10-01T12:54:32Z'
    },
    relationships: {
      paragraph: {
        data: {
          id: paragraphId,
          type: 'paragraphs'
        }
      }
    }
  };
}
