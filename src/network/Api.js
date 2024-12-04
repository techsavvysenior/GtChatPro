import React from 'react';
import { Alert,BackHandler } from 'react-native';

import * as Helpers from '../assets/Exporter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNRestart from 'react-native-restart';

const BASE_URL = 'BASE_URL';


class Api {
    static headers() {
        return {

            'Content-Type': 'application/json',
            'Accept': 'application/json'

        };

        
    }

    static showAlert() {
        Alert.alert(
          'Network Error!',
          'Your Internet is not working properly',
          [
    
            { text: 'Restart', onPress: () => RNRestart.Restart() },
            { text: 'Exit App', onPress: () => BackHandler.exitApp() },

          ],
          { cancelable: false },
        );
      }

    static get(route) {
        return this.func(route, null, 'GET');
    }
    static post(route, params) {
        return this.func(route, params, 'POST');
    }
    static put(route, params) {
        return this.func(route, params, 'PUT');
    }
    static delete(route, params) {
        return this.func(route, params, 'DELETE');
    }

    static async func(route, params, verb) {

        const url = `${BASE_URL}/${route}`;
        let options = Object.assign({ method: verb }, params ? { body: JSON.stringify(params) } : null);
        options.headers = Api.headers();

        const apiKey = await AsyncStorage.getItem('API_TOKEN');
        options.headers['Authorization'] = `Bearer ${apiKey}`;


        return fetch(url, options).then(resp => {


            let json = resp.json();

            if (resp.ok) {
                return json;
            }
            if (resp.status == 500) {
                Helpers.showToast('Internal Server Error');
                return { success: false };
            }

            return json.then(err => { throw err; });
        }).catch(err => {
            console.log('error is=',err.message);
            if(err.message==='Too Many Attempts.'){
                // console.warn('error is ', err.message);

            }else if(err.message==="Unauthenticated."){
                // console.warn("error is",err.message)
            }else if (err.message=="Network request failed"){
                this.showAlert();
            }else{
            Helpers.showToast(err.message);
            // console.log("erro msg===>",err.message)

            }
            return { success: false, err:err.message };
            // console.log('error is ', json)
            // Helpers.showToast('Error')

        });

    }
}
export default Api;