import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import rootSaga from '../store/sagas';

import { AuthReducer } from '../store/reducers/AuthReducer';
import createSagaMiddleware from 'redux-saga';

import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';


let composeEnhancers = compose;
const createDebugger = require('redux-flipper').default;

if (__DEV__) {

    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

}
const sagaMiddleware = createSagaMiddleware();

const rootReducer = combineReducers({
    AuthReducer
});

const persistConfig = {

    key: 'root',
    storage: AsyncStorage,
    whitelist: ['AuthReducer']
  
};

const middleware = applyMiddleware(

    createDebugger(),
    sagaMiddleware

);

// AsyncStorage.getAllKeys((err, keys) => {
//       AsyncStorage.multiGet(keys, (error, stores) => {
//         stores.map((result, i, store) => {
//           console.log('log async: ',{ [store[i][0]]: store[i][1] });
//           return true;
//         });
//       });
//     });

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = createStore(persistedReducer, composeEnhancers(middleware));
export const persistedStore = persistStore(store);

sagaMiddleware.run(rootSaga);
