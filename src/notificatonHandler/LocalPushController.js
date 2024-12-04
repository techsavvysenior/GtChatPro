import PushNotification from 'react-native-push-notification'
import * as RootNavigation from '../navigation/RootNavigation'
import {  CommonActions } from '@react-navigation/native';



PushNotification?.configure({

      // (required) Called when a remote or local notification is opened or received
      onNotification: function (notification) {
            if(notification.userInteraction==true){
            const item=JSON.parse(notification.data.user)
            console.log('LOCAL NOTIFICATION from configure ==>', notification)
            
       
            RootNavigation.navigate("Contacts")
           
            setTimeout(() => {
                  
                 RootNavigation.navigate(notification.data.type, {item:item})
            }, 100); 

            }
      },

      popInitialNotification: true,
      requestPermissions: true
})
PushNotification?.createChannel(
      {
            channelId: 'com.gtChatPro.app', // (required)
            channelName: 'My channel', // (required)
            channelDescription: 'A channel to categorise your notifications', // (optional) default: undefined.
            playSound: false, // (optional) default: true
            soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
            // importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
            vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
            data: {}
      },
      () => { },
);
export const LocalNotification = (remoteMessage) => {


      PushNotification?.localNotification({
            channelId: 'com.gtChatPro.app',
            autoCancel: true,
            bigText: '',
            subText: '',
            title: remoteMessage.notification.title,
            message: remoteMessage.notification.body,
            vibrate: true,
            vibration: 300,
            playSound: true,
            priority: 'high',
            soundName: 'default',
            data:remoteMessage.data,
            // id:'123'

            // actions: '["Yes", "No"]'
      })
      // PushNotification.cancelLocalNotification(id)

      setTimeout(() => {
            PushNotification?.removeAllDeliveredNotifications();
      }, 1000);


}

export const ClearNotification=()=>{
      setTimeout(() => {
            PushNotification?.removeAllDeliveredNotifications();
      }, 1000); 
}