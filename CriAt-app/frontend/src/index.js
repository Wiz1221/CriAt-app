import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';

import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

import App from './Components/App/App';

// Redux
import { Provider } from 'react-redux';
import { initStore } from './Store/Store';

// Actions
import { getData } from './Actions/DataAction';

const store = initStore();

store.dispatch(getData());

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>
  , document.getElementById('root')
);
registerServiceWorker();
