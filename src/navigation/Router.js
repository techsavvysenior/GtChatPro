import * as React from 'react';
import { Text, View, SafeAreaView, AppState } from 'react-native';

import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { useEffect, useState, useRef } from 'react'
import Login from '../screens/Login';
import Contacts from '../screens/tabs/Contacts';
// import Home from '../screens/Home';
import BottomTabs from './BottomTabs';
import Chat from '../screens/Chat';
import { useDispatch } from 'react-redux';
import { allActions } from '../store/actions/allActions'
import Api from '../network/Api';
import * as Helpers from '../assets/Exporter'
import messaging from '@react-native-firebase/messaging';




import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Team from '../screens/tabs/Team';
import Archives from '../screens/tabs/Archives';
import { navigationRef } from './RootNavigation';
import Blocked from '../screens/tabs/Blocked';


const Router = (props) => {
    const dispatch = useDispatch();

    const apiKey = useSelector(state => state.AuthReducer.users.api_key);
    const remembered = useSelector(state => state.AuthReducer.users.RememberMe);
    //   const reducer = useSelector(state => state.AuthReducer);
    // console.log("reducer====>",reducer)
    const client_id = useSelector(state => state.AuthReducer.users.id)

    const appState = useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = useState(appState.current);



    const userLoginAPi = async (status) => {
        let params = { user_id: client_id, user_status: 0 }
        let res = await Api.post('messenger/update-owner-status', params);
        // console.log(res)
        if (res.success) {
            // console.log('Update owner status res===>',res)

        }
        else {

            if (res.err == "Unauthenticated.") {
                AsyncStorage.removeItem('API_TOKEN')
                dispatch({ type: allActions.LOG_OUT, payload: '' })
            }
        }
    }


    const logoutFunc = async () => {
        userLoginAPi()
        let res = await Api.post('logout_api', '');
        console.log('logout api response is===>', res)
        let res1 = JSON.stringify(res)
        console.log('log out==>', res1)
        // AsyncStorage.removeItem('API_TOKEN')
        // dispatch({ type: allActions.LOG_OUT,payload: ''})

        if (res1.includes('Successfully logged out')) {



            Helpers.showToast("You've logged out")
            AsyncStorage.removeItem('API_TOKEN')
            dispatch({ type: allActions.LOG_OUT, payload: '' })
            messaging().unsubscribeFromTopic("Global")
            messaging().unsubscribeFromTopic("Chat")
            // RNRestart.Restart();

        } else {
            if (res.err == "Unauthenticated.") {
                AsyncStorage.removeItem('API_TOKEN')
                dispatch({ type: allActions.LOG_OUT, payload: '' })

                // Helpers.showToast("You've Been Logged out")
            }
        }
        // props.navigation.navigate('Login')
        //  return (<Router />)


    }


    const remb = useRef(remembered)
    useEffect(() => {
        const subscription = AppState.addEventListener("change", nextAppState => {
            // console.log('Current state App is==>',AppState.currentState)

            // appState.current = nextAppState;
            setAppStateVisible(appState.current);
            // console.log("AppState", appState.current);
            //   if (appState.current=='inactive'){
            //       console.log("App is inactive")
            //   }else if (appState.current=='active'){
            //     console.log("App is foreground")
            // }else if (appState.current=='background'){
            //     console.log("App is background")
            // }else{
            //     console.log('app is killed')
            //     if(remembered==false){
            //       //   console.log('remember false so dispatch')
            //   dispatch({ type: allActions.LOG_OUT,payload: ''})
            //     }else{
            //       //   console.log('rememered was true')
            //     }
            // }

            // console.log("Remembered in route===>",remembered)
            // AppState.addEventListener('memoryWarning', () => {
            //     console.log('Device running out of memory!');
            // });
            // AppState.addEventListener('focus', () => {
            //     console.log('APP in FOcus ');
            // });
            if (AppState.currentState == 'inactive') {
                console.log("App is inactive")
            } else if (AppState.currentState == 'active') {
                console.log("App is foreground")
            } else if (AppState.currentState == 'background') {
                console.log("App is background")
                if (Platform.OS == 'android') {
                    if (remembered == false) {
                        // dispatch({ type: allActions.LOG_OUT,payload: ''})
                        //   logoutFunc()
                        console.log("Noting for android")
                    }
                }
            } else {
                console.log('app is killed')
                if (remembered == false) {
                    //   console.log('remember false so dispatch')
                    // dispatch({ type: allActions.LOG_OUT,payload: ''})
                    logoutFunc()

                } else {
                    console.log('rememered was true')
                }
            }


        });

        return () => {
            subscription.remove();
        };
    }, [remembered]);




    const AuthStack = createNativeStackNavigator();
    const AuthStackScreens = () => (

        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={Login} />
        </AuthStack.Navigator>

    );
    const MainStackScreens = () => (

        <AuthStack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
            <AuthStack.Screen name="Home" component={BottomTabs} />
            <AuthStack.Screen name="Chat" component={Chat} />
            <AuthStack.Screen name="Archive" component={Archives} />
            <AuthStack.Screen name="Transferred Chat" component={Team} />
            <AuthStack.Screen name ="Blocked" component={Blocked}/>

        </AuthStack.Navigator>

    );
    return (

        <NavigationContainer ref={navigationRef}>
            {apiKey === '' || apiKey === undefined ? <AuthStackScreens /> : <MainStackScreens />}
            {/* <AuthStackScreens />  */}
        </NavigationContainer>
    );



};

export default Router;