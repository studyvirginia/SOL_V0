const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { Renderer } = require('@json-render/react');
const { defineRegistry } = require('@json-render/react');
const { solCatalog } = require('./lib/renderCatalog');

const { registry } = defineRegistry(solCatalog, {
  components: {
    Flashcards: () => React.createElement('div', null, 'Flashcards')
  }
});

try {
  const element = React.createElement(Renderer, {
    spec: {
      root: 'my_comp',
      elements: {
        my_comp: {
          type: 'Flashcards',
          props: { cards: [] }
        }
      },
      state: {}
    },
    registry: registry
  });
  
  console.log(ReactDOMServer.renderToString(element));
} catch (e) {
  console.error(e.stack);
}
