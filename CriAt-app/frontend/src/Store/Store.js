import { createStore, compose, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import DataReducer from '../Reducers/DataReducer';

export let initStore = () => {

    const reducer = combineReducers({
        data: DataReducer,
        // config: DataReducer
    });

    const store = createStore(reducer,
        compose(applyMiddleware(thunk),
            window.devToolsExtension ? window.devToolsExtension() : f => f
        ))

    return store;
}
