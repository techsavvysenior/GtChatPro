// import React,{ useEffect, useRef, useState } from 'react';
// import io from 'socket.io-client';

// import { StyleSheet, View, Text, Image, TouchableOpacity, FlatList } from 'react-native'

// export const SocketManager = (userId, enabled, onConnected) => {
//   const ref = useRef();
//   const [messages, setMessages] = useState([]);

//   const send = () => {
//     console.log("Hello Boy")
//   }
  

//   useEffect(() => {
//     console.log("Hello useEffect")

//     if (!enabled) {
//       return;
//     } 
 
//     const socket = io("https://socket.agilepusher.com", { 'reconnection': true, 'reconnectionDelay': 50000, 'reconnectionDelayMax': 50000, 'reconnectionAttempts': 3, 'query': { apiKey: 'key_52EOf8FHdz9oWkAq8z3462BKmlxZvu3E', type: "gtChatPro" }, transports: ['websocket'], })


//     socket.on('disconnect', () => {
//       console.log('disconnected');
//     });

//     socket.on('connect', () => {
//       console.log('done done london ');
//     });

//     socket.on('agInfoMessage_dev', (msg) => {
//       console.log("getting test message", msg)
//     });

//     socket.on('reconnect', () => {
//       socket.emit('joinRoom', userId);
//     });


//     return () => socket.disconnect();
//   }, [enabled, userId]);

//   // return {
//   //   send
  
//   // };
//   return(
//     <View>
//       <Text>assaasassa</Text>
//     </View>
//   )
// }
