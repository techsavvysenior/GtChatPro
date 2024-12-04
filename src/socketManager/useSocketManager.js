import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { LocalNotification } from '../notificatonHandler/LocalPushController';

const useSocketManager = (props) => {

    const [msg, setMsg] = useState();
    const [connected, setconnected] = useState(false);

    const apiKeySocket = useSelector(state => state.AuthReducer.users.api_key);
    const socket = io('https://socket.agilepusher.com', { 'reconnection': true, 'reconnectionDelay': 50000, 'reconnectionDelayMax': 50000, 'reconnectionAttempts': 3, 'query': { apiKey: apiKeySocket, type: 'gtChatPro' }, transports: ['websocket'], });
 
    useEffect(() => {

        socket.on('disconnect', () => {
            console.log('disconnected');
        });

        socket.on('connect', () => {
            console.log('done done london ');
            setconnected(true)
            // addHandlers();
        });


        socket.on('reconnect', () => {

            console.log('Reconnect is Working.');
            // addHandlers();
             setconnected(true)
        });

    }, []);


    const addHandlers = () => {

        initConnectionParams();
        getNewMessage()
    };

    function initConnectionParams(roomID, receiverID, userId) {

        console.log('initconnectparams', 'roomId', roomID, 'receiver', receiverID, 'userId', userId);
        let user_id = 66;

        socket.on('agAskedToJoin', function (room, receiver) {

            console.log('roomjoines1122', room, 'receiver', receiver);
            if (room) {
                console.log("room ma hm hain",room)
                // LocalNotification()
            }
            if (user_id == receiver) {

                console.log('inside emit');
                socket.emit('agRoomJoined', room, userId, '');
            }

        });
    }
    function getNewMessage() {

        socket.on('agGotNewMessage', function (msg, sender, chatId) {
            console.log('agGotNewMessagehook', msg, 'chat_id ', chatId, 'sender', sender);
            
            setMsg(

                {
                    _id: Math.random().toString(36).slice(2),
                    text: msg,
                    createdAt: new Date(),
                    user: { _id: sender }

                }

            );
        });
    }


    function sendMessage(msg, userId, RoomId) {

        console.log('sendMessageInfo', msg, 'RoomId', RoomId, 'userId', userId);
        socket.emit('agSendMessage', RoomId, msg, userId, RoomId);
    }

    return {

        sendMessage,
        addHandlers,
        initConnectionParams,
        getNewMessage,
        msg, connected
    };

};

export default useSocketManager;