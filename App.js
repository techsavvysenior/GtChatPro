import { Text, View, SafeAreaView, AppState } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';

import SplashScreen from 'react-native-splash-screen';


import Router from './src/navigation/Router';

import { store, persistedStore } from './src/store/Store';
import { Provider } from 'react-redux';
import io from 'socket.io-client';
import { PersistGate } from 'redux-persist/integration/react';
import useSocketManager from './src/socketManager/useSocketManager';
import { LogBox } from 'react-native'
import { useDispatch } from 'react-redux';
import { ContactsData } from './src/store/actions/AuthActions';
import firebase from '@react-native-firebase/app';

const App = () => {

    // const {connected } = useSocketManager();
    //     const appState = useRef(AppState.currentState);
    //   const [appStateVisible, setAppStateVisible] = useState(appState.current);


    //   useEffect(() => {
    //     const subscription = AppState.addEventListener("change", nextAppState => {
    //     //   if (
    //     //     appState.current.match(/inactive|background/) &&
    //     //     nextAppState === "active"
    //     //   ) {
    //     //     console.log("App has come to the foreground!");
    //     //   }

    //       appState.current = nextAppState;
    //       setAppStateVisible(appState.current);
    //       console.log("AppState", appState.current);
    //       if (appState.current=='inactive'){
    //           console.log("App is inactive")
    //       }else if (appState.current=='active'){
    //         console.log("App is foreground")
    //     }else if (appState.current=='background'){
    //         console.log("App is background")
    //     }else{
    //         console.log('app is killed')
    //     }


    //     });

    //     return () => {
    //       subscription.remove();
    //     };
    //   }, []);


    // LogBox.ignoreAllLogs();

    // useEffect(() => {
    //     // SplashScreen.hide();

    // }, []);
    useEffect(() => {
        // const initializeFirebase = () => {
        //   if (!firebase.apps.length) {
        //     firebase.initializeApp({
        //       apiKey: 'AIzaSyAuTg5PLuCi_b06UBifjpfVcCqPRZKbSJs',
        //       authDomain: 'adforest-ab45e.firebaseapp.com',
        //       projectId: 'adforest-ab45e',
        //       storageBucket: 'adforest-ab45e.appspot.com',
        //       messagingSenderId: '170168176816',
        //       appId: '1:170168176816:ios:fc787efc4fd5673a',
        //       measurementId: 'G-XXXXXXX',
        //       databaseURL: 'https://adforest-ab45e.firebaseio.com',
        //     });
        //   } else {
        //     firebase.app();
        //   }
        // };

        // initializeFirebase();

        if (firebase.apps.length) {
            console.log('Firebase Initialized', firebase.apps);
        } else {
            console.log('Firebase not initialized');
        }
    }, []);

    return (

        <Provider store={store}>
            <PersistGate persistor={persistedStore}>
                <SafeAreaView style={{ flex: 1, }}>

                    <Router />
                </SafeAreaView>
            </PersistGate>

        </Provider>
        // <SafeAreaView style={{ flex: 1, }}>
        //     <Text>aaaa</Text>
        // </SafeAreaView>

    );
};

export default App;