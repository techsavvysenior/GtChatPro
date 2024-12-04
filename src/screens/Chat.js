import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, Keyboard, LogBox, Linking, PermissionsAndroid, ActivityIndicator, Animated, Alert, BackHandler } from 'react-native';

import { Icon, Badge } from 'react-native-elements';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as Helpers from '../assets/Exporter';
import io from 'socket.io-client';
import { Bubble, GiftedChat, Send, InputToolbar } from 'react-native-gifted-chat';
import Api from '../network/Api';
import useSocketManager from '../socketManager/useSocketManager';
import { useSelector, useDispatch } from 'react-redux';
import { Avatar } from 'react-native-elements/dist/avatar/Avatar';
import EmojiInput from 'react-native-emoji-input';
import ImagePicker from 'react-native-image-crop-picker';
import { Platform } from 'react-native';
import MapView from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import AudioRecorderPlayer, {
    AVEncoderAudioQualityIOSType,
    AVEncodingOption,
    AudioEncoderAndroidType,
    AudioSet,
    AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import { Pressable } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob'
import Modal from "react-native-modal";
import { TextInput } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import CustomModal from '../components/CustomModal';
import FastImage from 'react-native-fast-image'
import SoundPlayer from 'react-native-sound-player'
import { useIsFocused } from '@react-navigation/native';
import { LinearProgress } from 'react-native-elements';
import AgentsModal from '../components/AgentsModal';
import { useRoute } from '@react-navigation/native';
import { allActions } from "../store/actions/allActions"
import moment from 'moment';
import messaging from '@react-native-firebase/messaging';
import { Menu, MenuItem, MenuDivider } from 'react-native-material-menu';


import { LocalNotification, ClearNotification } from '../notificatonHandler/LocalPushController'
import CallsModal from '../components/CallsModal';
import { ArchiveData, ContactsData, VisitorData } from '../store/actions/AuthActions';
import DocumentPicker, { types } from 'react-native-document-picker';

import { request, PERMISSIONS, requestMultiple, checkMultiple } from 'react-native-permissions';
import { number } from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';


const audioRecorderPlayer = new AudioRecorderPlayer();
const LocationView = ({ location }) => {
    let locationValues = JSON.parse(location)
    // console.log('location==>', locationValues.latitude)
    const openMaps = () => {
        const url = Platform.select({
            ios: `http://maps.apple.com/?ll=${locationValues.latitude},${locationValues.longitude}`,
            android: `http://maps.google.com/?q=${locationValues.latitude},${locationValues.longitude}`,
        });
        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    return Linking.openURL(url);
                }
            })
            .catch((err) => {
                // console.error('An error occurred', err);
            });
    };
    // alert(location.latitude)
    return (
        <TouchableOpacity
            onPress={openMaps}
            style={{ backgroundColor: 'gray', width: 250, height: 250 }}>
            <MapView
                style={{ height: 250, width: 250 }}
                region={{
                    latitude: locationValues.latitude,
                    longitude: locationValues.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005
                }}
                annotations={[
                    {
                        latitude: locationValues.latitude,
                        longitude: locationValues.longitude,
                    },
                ]}
                scrollEnabled={false}
                zoomEnabled={true}
            >
                <MapView.Marker
                    coordinate={{
                        latitude: locationValues.latitude,
                        longitude: locationValues.longitude
                    }}
                    title={"title"}
                    description={"description"}
                />
            </MapView>
        </TouchableOpacity>
    );
};


const Chat = (props) => {
    console.log("ChatProps", props)
    const apiKeySocket = useSelector(state => state.AuthReducer.users.api_key);
    const socket = io('https://socket.agilepusher.com', { 'reconnection': true, 'reconnectionDelay': 50000, 'reconnectionDelayMax': 50000, 'reconnectionAttempts': 3, 'query': { apiKey: apiKeySocket, type: 'gtChatPro' }, transports: ['websocket'], });
    var UID = ''
    const BASE_URL = 'BASE_URL';

    var Sound = require('react-native-sound');
    const { navigation } = props
    const dispatch = useDispatch();




    const [apiKey, client_id] = useSelector(state => [state.AuthReducer.users.api_key, state.AuthReducer.users.id]);
    const agent_name = useSelector(state => state.AuthReducer.users.name)




    const userToken = useSelector(state => state.AuthReducer.users?.api_token)


    const currentScreenRoute = useSelector(state => state.AuthReducer.currentScreen)
    // console.log("Current Screen===>",currentScreenRoute)

    let chatId = props.route.params.item.id;
    let currentChatId = props.route.params.item.id;

    let userProps = props.route.params.item;
    // console.log("user props=>", userProps)

    const CurrentChatReceiver = props.route.params.item.user_id
    // console.log('Route receiver Params==>',CurrentChatReceiver)
    let ParamsAvatar = props?.route?.params?.item?.avatar






    LogBox.ignoreAllLogs();
    LogBox.ignoreLogs(["EventEmitter.removeListener"]);
    const [messages, setMessages] = useState([]);
    const [loading, set_loading] = useState(true);
    const [onlineStatus, set_onlineStatus] = useState(userProps?.user_status);

    const [messagesSeenStatus, setMessagesSeenStatus] = useState(0);

    const [textMessage, setTextMessage] = useState('');
    const [showEmojiBoard, setShowEmojiBoard] = useState(false)
    const [showCallModal, setShowCallModal] = useState(false)
    const [showDate, setShowDate] = useState(false)
    const [phoneNumber, setPhoneNumber] = useState(null)
    const [selectedDate, setSelectedDate] = useState('')

    const [agentsList, set_agentsList] = useState([]);
    const [isAgentsModalVisible, setAgentsModalVisible] = useState(false);
    const [callsList, set_callsList] = useState([]);
    const [todayCallsCount, set_todayCallsCount] = useState([]);



    const [showAttachmentsModal, setShowAttachmentsModal] = useState(false)



    const [currentPlayedMessage, setCurrentPlayedMessage] = useState(null)

    const [visitorIsTyping, setVisitorIsTyping] = useState(false)
    const [chatAccept, setChatAccept] = useState(false)
    const [socketConnected, setSocketConnected] = useState(false)
    const [isAcceptedSocket, setIsAcceptedSocket] = useState(false)

    const [socketDisconnectText, setSocketDisconnectText] = useState("Establishing Connection Please Wait....")


    const [submitButtonLoader, setSubmitButtonLoader] = useState(false)
    const [audioLoader, setAudioLoader] = useState(false)


    const [closeChatFlag, setCloseChatFlag] = useState(false)
    const [menuVisible, setMenuVisible] = useState(false)

    const [sendingMsg, setSendingMsg] = useState(false)

    const [audioIsPlaying, setAudioIsPlaying] = useState(false)

    const [audioStartState, setAudioStartState] = useState(null)






    const [spamStatus, setSpamStatus] = useState(userProps?.spam)



    const [onlineRoomId, setOnlineRoomId] = useState()
    const [offlineRoomId, setOfflineRoomId] = useState()

    const [visitorIsTypingMsg, setVisitorIsTypingMsg] = useState('')
    const currentRoute = useRoute();
    const [showFileLoader, setFileLoader] = useState(false)
    const [showAudioLoader, setShowAudioLoader] = useState(false)

    const [playWidth, setPlayWidth] = useState({});

    const [countForOnline, setCountForOnline] = useState(0)
    const [fadeAnim] = useState(new Animated.Value(0));

    const toggleEmojiBoard = () => {
        setShowEmojiBoard(!showEmojiBoard)
        Keyboard.dismiss()
    }






    useEffect(() => {

        getMessages();
        getAgents();
        // getVoiceAndStoragePermissions();
        getCallsList();

    }, []);
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setShowEmojiBoard(false) // or some other action
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                // console.log('keyboard hide') // or some other action
            }
        );


        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // console.log('Refreshed Chat Screen!');
            hitRejectSocket();

            dispatch({ type: allActions.CURRENT_SCREEN, payload: currentRoute?.name })

        });

        return unsubscribe;
    }, [navigation]);


    useEffect(() => {
        // if(Platform.OS=="android")
        const unsubscribe = messaging().onMessage(async (remoteMessage) => {
            console.log('remote message==>', remoteMessage)
            const item = JSON.parse(remoteMessage?.data?.user)
            console.log("Item", item)
            // console.log("cuurent screen==>",currentScreenRoute)
            // console.log("cuurent screen==>",typeof(currentScreenRoute))

            if (item.id != currentChatId) {

                LocalNotification(remoteMessage);
            }

        });




        return unsubscribe;
        // }
    }, [currentScreenRoute]);

    useEffect(() => {



        socket.on('disconnect', () => {
            console.log('disconnected');
            setSocketDisconnectText("Disconnected, Tying to Reconnect...")
            setSocketConnected(false)

        });

        socket.on('connect', async () => {
            // console.log('Inside Chat Screen Connected');
            setSocketConnected(true)
            console.log("shtaka", props.route.params.isClosed == 1, props?.route?.params?.item?.id, `${props?.route?.params?.item?.user_id.toString()}`)
            if (props?.route?.params?.isClosed == 1) {
                socket.emit('restart_chat', props?.route?.params?.item?.id.toString(), `${props?.route?.params?.item?.user_id.toString()}`)
                // let res = await Api.get(`messenger/close-chat?chat_id=${props?.route?.params?.item?.id}`);
                // console.log("CLoseAPI Res", res)
                // if (res.success) {
                //     setCloseChatFlag(true)
                //     // props.navigation.goBack()
                //     Helpers.showToast(res.message)

                // }
                // else {
                //     Helpers.showToast(res.message)
                // }

            } else {
                console.log('shtakaelse', props.route.params.isClosed)
            }
            initConnectionParams()
            getNewMessage()
            hitRejectSocket()
            // getAgents();
            joinAllAgents()

            // addHandlers();
        });



        socket.on('reconnect', () => {

            console.log('Reconnect is Working.');
            // addHandlers();

        });

        return () => {
            setMessages([]); // This worked for me
            console.log("Return function of socket useEffect chat screen")
        };

    }, []);


    useEffect(() => {
        const updateSeen = () => {
            updateSeenStatusApi(currentChatId)
        }
        return updateSeen
    }, [messages])

    useEffect(() => {
        if (isAgentsModalVisible) {
            getAgents();
        }

        //   return () => {
        //       cleanup
        //   }
    }, [isAgentsModalVisible])

    useEffect(() => {
        if (showCallModal) {
            getCallsList();
        }

        //   return () => {
        //       cleanup
        //   }
    }, [showCallModal])



    useEffect(() => {

        setUserStatus();
        return () => {
            setUserStatus();
        }
    }, [countForOnline])


    const goBackDispatch = () => {

        let Params = {
            api_key: apiKey,
            page: 1
        }
        props.navigation.goBack()
        dispatch(ContactsData(Params))
        dispatch(ArchiveData(Params))
        dispatch(VisitorData(Params))
        onStopPlay()
    }


    useEffect(() => {
        const backAction = () => {
            goBackDispatch();
            return true;
        };


        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, []);



    const checkIosMediaPermissions = () => {
        console.log("into check ios permissions")
        checkMultiple([PERMISSIONS.IOS.PHOTO_LIBRARY]).then((status) => {
            console.log("Photos Lib permission ios=>", status[PERMISSIONS.IOS.PHOTO_LIBRARY])
            if (status[PERMISSIONS.IOS.PHOTO_LIBRARY] == "granted") {
                console.log("status granted")
                openIosImagePicker()
            } else if (status[PERMISSIONS.IOS.PHOTO_LIBRARY] == "denied") {
                requestIosMediaPermissions()
            } else {
                Alert.alert(
                    "Permissions Required",
                    `Photos Permission is required, kindly allow it from settings`,
                    [
                        {
                            text: `Go to Settings`,
                            onPress: () => {
                                Linking.openURL('app-settings:')
                            }
                        },
                        {
                            text: "Cancel",
                            onPress: () => console.log("Cancel Pressed"),
                            style: "cancel",
                        },
                    ],
                    {
                        cancelable: false,
                        onDismiss: () =>
                            console.log('alert was dismissed due to tapping outside of the alert box')
                    }
                );

            }

        })
    }

    const requestIosMediaPermissions = () => {
        requestMultiple([PERMISSIONS.IOS.PHOTO_LIBRARY]).then((statuses) => {
            console.log('Photo library permission', statuses[PERMISSIONS.IOS.PHOTO_LIBRARY]);
            checkIosMediaPermissions()
        });
    }



    const checkIosFilePermissions = () => {
        console.log("into check ios permissions")
        checkMultiple([PERMISSIONS.IOS.PHOTO_LIBRARY]).then((status) => {
            // console.log("mic permission ios=>",status[PERMISSIONS.IOS.MICROPHONE])
            console.log("Photos Lib permission ios=>", status[PERMISSIONS.IOS.PHOTO_LIBRARY])
            if (status[PERMISSIONS.IOS.PHOTO_LIBRARY] == "granted") {
                console.log("status granted")
                IosFilePicker()
            } else if (status[PERMISSIONS.IOS.PHOTO_LIBRARY] == "denied") {
                requestIosFilePermissions()
            } else {
                Alert.alert(
                    "Permissions Required",
                    `Photos Permission is required, kindly allow it from settings`,
                    [
                        {
                            text: `Go to Settings`,
                            onPress: () => {
                                Linking.openURL('app-settings:')
                            }
                        },
                        {
                            text: "Cancel",
                            onPress: () => console.log("Cancel Pressed"),
                            style: "cancel",
                        },
                    ],
                    {
                        cancelable: false,
                        onDismiss: () =>
                            console.log('alert was dismissed due to tapping outside of the alert box')
                    }
                );

            }

        })
    }

    const requestIosFilePermissions = () => {
        requestMultiple([PERMISSIONS.IOS.PHOTO_LIBRARY]).then((statuses) => {
            console.log('Photo library permission', statuses[PERMISSIONS.IOS.PHOTO_LIBRARY]);
            checkIosFilePermissions()
        });
    }




    const checkIosMicPermissions = () => {
        console.log("into check ios permissions")
        checkMultiple([PERMISSIONS.IOS.MICROPHONE]).then((status) => {
            // console.log("mic permission ios=>",status[PERMISSIONS.IOS.MICROPHONE])
            console.log("Photos Lib permission ios=>", status[PERMISSIONS.IOS.MICROPHONE])
            if (status[PERMISSIONS.IOS.MICROPHONE] == "granted") {
                console.log("status granted")
                sendVoice = 1
                onStartRecord();



            } else if (status[PERMISSIONS.IOS.MICROPHONE] == "denied") {
                requestIosMicPermissions()
            } else {
                Alert.alert(
                    "Permissions Required",
                    `Photos Permission is required, kindly allow it from settings`,
                    [
                        {
                            text: `Go to Settings`,
                            onPress: () => {
                                Linking.openURL('app-settings:')
                            }
                        },
                        {
                            text: "Cancel",
                            onPress: () => console.log("Cancel Pressed"),
                            style: "cancel",
                        },
                    ],
                    {
                        cancelable: false,
                        onDismiss: () =>
                            console.log('alert was dismissed due to tapping outside of the alert box')
                    }
                );

            }

        })
    }

    const requestIosMicPermissions = () => {
        requestMultiple([PERMISSIONS.IOS.MICROPHONE]).then((statuses) => {
            console.log('Photo library permission', statuses[PERMISSIONS.IOS.MICROPHONE]);
            checkIosMicPermissions()
        });
    }


    const hitRejectSocket = () => {

        socket.on('reject', function (agentName, chatID) {
            console.log("reject chat==>", agentName)

            // if (agentName != agent_name && chatID == currentChatId) {
            if (agentName?.agent_name != agent_name && chatID == currentChatId) {


                setIsAcceptedSocket(true)
                setTimeout(() => {
                    // props.navigation.goBack()
                    goBackDispatch()

                }, 4000);
            } else {
                // console.log("else part from reject socket")
            }

        });


    }

    const RejectChatFunc = () => {
        // props.navigation.goBack()
        goBackDispatch()


    }


    function initConnectionParams(roomID, receiverID, userId) {
        console.log('Chat screen init params,')
        let user_id = client_id;

        socket.emit('agRoomJoined', chatId.toString(), user_id, userProps.user_id);

        socket.on('agAskedToJoin', function (room, receiver) {

            // console.log('agAskedToJoin from Chat screen==>', room, 'receiver', receiver);
            // getNewMessage()

            if (room) {
                // console.log("room ma hm hain", room)
                //   LocalNotifications()
            }
            if (user_id == receiver) {

                // console.log('inside emit in chat', user_id);
                socket.emit('agRoomJoined', chatId.toString(), user_id, userProps.user_id);
            }

        });


        socket.on("agOffline", function (room, visitor) {
            console.log(visitor + ' has left.', "room ", room);

            // console.log("ag Offline Console Current user Chat=>",currentChatId)
            setOfflineRoomId(room)
            setCountForOnline(1)


        });


        socket.on('agInfoMessage_dev', function (msg) {

            // console.log("message dev", msg);
            if (msg?.includes('user_status_online')) {
                var arr = msg.split("_");

                setOnlineRoomId(arr[3])
                setCountForOnline(1)



            }
        });

        socket.on('restart_chat', function (msg) {

            console.log("message dev restart_chat", msg);


        })
    }


    const setUserStatus = () => {

        if (offlineRoomId) {
            if (currentChatId == offlineRoomId) {
                console.log("offline if")
                set_onlineStatus(0)
            }
        }

        if (onlineRoomId) {
            if (currentChatId == onlineRoomId) {
                setTimeout(() => {
                    console.log("online")
                    set_onlineStatus(1)
                }, 3000);
            }

        }




        // .route.params.item.id
        setCountForOnline(0);

    }


    // let notificationFlag=false;
    function getNewMessage() {




        socket.on('agGotNewMessage', function (msg, sender, chatId, type, msgWithout) {
            console.log('agGotNewMessage from Chat screen ', msg, 'chat_id ', chatId, 'sender', sender, ' type =', type,)

            // console.log("agGotNewMessage====>",CurrentChatReceiver)
            var lstIndex = msg.lastIndexOf('_');
            var NewImgUri = msg.substring(0, lstIndex)

            const extension = msgWithout.split('.').pop()
            // const extArr=ext.split('_')

            // const extension=extArr[0]
            console.log("extension==>", extension)


            if (type == "file") {
                if (extension == "pdf" || extension == "doc" || extension == "docs" || extension == "docx" || extension == "xlsx" || extension == "xlx" || extension == "xls" || extension == "wav" || extension == "mp4" || extension == "mkv" || extension == "webm" || extension == "ogg") {
                    console.log("into")
                    getMessagesBackground()

                }

            }

            // if (Platform.OS == "ios") {
            //     if (msgType == "file" || msgType == "voice") {
            //         msgType = "download"

            //     }
            // }
            // console.log("file extensions are===>", extension)

            if (CurrentChatReceiver == sender) {
                let newMessage = {

                    _id: Math.random().toString(36).slice(2),
                    text: type == 'text' ? msg : '',
                    image: type == 'file' ? NewImgUri : '',
                    location: type == 'map' ? msg : '',
                    audio: type == 'voice' ? msg : '',
                    // file: msgType == 'download' ? msg : '',
                    extension: extension,
                    createdAt: new Date(),
                    user: { _id: 1 }

                }
                // console.log('new msg===>', newMessage)
                setMessages(previousMessages => GiftedChat.append(previousMessages, newMessage))
                setMessagesSeenStatus(0)



            }

        });


        socket.on('agStopTyping', function (chat_id) {

            // console.log("stopped")
            setVisitorIsTyping(false)
            setVisitorIsTypingMsg('')
        });

        socket.on('agTyping', function (msg, room) {
            // console.log("visitor is typing message===>", msg, " room ", room)
            if (msg === true) {

            } else {
                if (spamStatus != 1) {
                    setVisitorIsTyping(true)
                    setVisitorIsTypingMsg(msg)
                }

            }

            // clearTimeout(timeout)

        });


        socket.on('agMessageSeen', function (message_id, chat_id) {

            console.log("ag Message Seen==>", chat_id)

            if (currentChatId == chat_id) {
                setMessagesSeenStatus(1)
            }

        });

    }

    const closeChat = async (chat_id, visitor_id) => {
        console.log("Chat id is==>", chat_id, " and visitor id is==>", visitor_id)

        socket.emit('close_chat', `${chat_id.toString()}`, visitor_id);
        let res = await Api.get(`messenger/close-chat?chat_id=${chat_id}`);
        console.log("CLoseAPI Res", res)
        if (res.success) {
            setCloseChatFlag(true)
            // props.navigation.goBack()
            Helpers.showToast(res.message)
            setTimeout(() => {
                goBackDispatch()
            }, 1000);
        }
        else {
            Helpers.showToast(res.message)
        }
    }


    const onStartTyping = (message) => {
        // console.log("before agTyping message====>", message)
        if (spamStatus != 1) {


            socket.emit('agRoomJoined', `${chatId}`, client_id, userProps.user_id);
            socket.emit('agTyping', '1447', true, 1447);
        }
    }

    const acceptChatApi = async () => {

        let params = { api_key: apiKey, chat_id: chatId }

        let res = await Api.post('messenger/accept-chat', params);

        if (res.success) {

            let msg = 'chat accepted' + "_" + client_id;
            socket.emit('agInfoMessage_dev', msg);
            setChatAccept(true)

            var agent_room = `agents_${apiKey}`;

            // socket.emit("accept", agent_room, agent_name, chatId);
            socket.emit("accept", agent_room, { agent_name: agent_name, department_id: res?.department_id }, chatId);

            socket.emit("accepted", `${chatId}`, client_id, chatId);

        } else {
            // Helpers.showToast('Something Went Wrong')
        }

    }

    const getMessages = async () => {
        const checkCOnnection = await AsyncStorage.getItem("socketConnect")
        console.log('checkCOnnection', checkCOnnection)
        setSocketConnected(checkCOnnection)
        let res = await Api.get(`messenger/profile/chat_messages?chat_id=${chatId}`);

        set_loading(true)

        if (res.success) {
            set_loading(false)

            let chatData = res.chats;

            // console.log('chat data====>', chatData[0])
            if (chatData[0]?.seen_status == 1 && chatData[0]?.sender_type == 0) {
                setMessagesSeenStatus(1)
            } else {
                setMessagesSeenStatus(0)
            }

            UID = chatData[0]?.receiver;

            setMessages(
                chatData.map((item, index) => {
                    let imguri = item?.message
                    var msgType = item?.type
                    // const extArr=["pdf","doc","docs","docx","xlsx","xlx","xls","wav","mp4","mkv","webm","ogg"]

                    const extension = item?.message.split('.').pop()
                    if (msgType == "file") {
                        if (extension == "pdf" || extension == "doc" || extension == "docs" || extension == "docx" || extension == "xlsx" || extension == "xlx" || extension == "xls" || extension == "wav" || extension == "mp4" || extension == "mkv" || extension == "webm" || extension == "ogg") {
                            // console.log("into")
                            msgType = "download"
                        } else if (extension == "mp3") {
                            msgType = "voice"
                        }

                    }

                    // if (Platform.OS == "ios") {
                    //     if (msgType == "file" || msgType == "voice") {
                    //         msgType = "download"

                    //     }
                    // }
                    console.log("file extensions are===>", extension)


                    return (

                        {

                            key: item.id,
                            _id: item.id,
                            text: msgType == 'file' ? '' : item.message,
                            image: msgType == 'file' ? imguri : '',
                            location: msgType == 'map' ? item.message : '',
                            audio: msgType == 'voice' ? item.message : '',
                            file: msgType == 'download' ? item.message : '',
                            createdAt: item.created_at,
                            user: { _id: item.sender_type },
                            extension: extension,

                            // key: item.id,
                            // _id: item.id,
                            // text: item.type == 'file' ? '' : item.message,
                            // image: item.type == 'file' ? imguri : '',
                            // location: item.type == 'map' ? item.message : '',
                            // audio: item.type == 'voice' ? item.message : '',
                            // createdAt: item.created_at,
                            // user: { _id: item.sender_type }


                        })
                })
            );
        }
        else {

            set_loading(false)

        }
    };



    const getMessagesBackground = async () => {

        let res = await Api.get(`messenger/profile/chat_messages?chat_id=${chatId}`);

        // set_loading(true)

        if (res.success) {


            // set_loading(false)

            let chatData = res.chats;

            // console.log('chat data====>', chatData[0])
            if (chatData[0]?.seen_status == 1 && chatData[0]?.sender_type == 0) {
                setMessagesSeenStatus(1)
            } else {
                setMessagesSeenStatus(0)
            }

            UID = chatData[0]?.receiver;

            setMessages(
                chatData.map((item, index) => {
                    let imguri = item?.message
                    var msgType = item?.type
                    // const extArr=["pdf","doc","docs","docx","xlsx","xlx","xls","wav","mp4","mkv","webm","ogg"]

                    const extension = item?.message.split('.').pop()
                    if (msgType == "file") {
                        if (extension == "pdf" || extension == "doc" || extension == "docs" || extension == "docx" || extension == "xlsx" || extension == "xlx" || extension == "xls" || extension == "wav" || extension == "mp4" || extension == "mkv" || extension == "webm" || extension == "ogg") {
                            console.log("into")
                            msgType = "download"
                        } else if (extension == "mp3") {
                            msgType = "voice"
                        }

                    }
                    // console.log("file extensions are===>", extension)
                    // if (Platform.OS == "ios") {
                    //     if (msgType == "file" || msgType == "voice") {
                    //         msgType = "download"

                    //     }
                    // }

                    return (

                        {

                            key: item.id,
                            _id: item.id,
                            text: msgType == 'file' ? '' : item.message,
                            image: msgType == 'file' ? imguri : '',
                            location: msgType == 'map' ? item.message : '',
                            audio: msgType == 'voice' ? item.message : '',
                            file: msgType == 'download' ? item.message : '',
                            createdAt: item.created_at,
                            user: { _id: item.sender_type },
                            extension: extension,

                            // key: item.id,
                            // _id: item.id,
                            // text: item.type == 'file' ? '' : item.message,
                            // image: item.type == 'file' ? imguri : '',
                            // location: item.type == 'map' ? item.message : '',
                            // audio: item.type == 'voice' ? item.message : '',
                            // createdAt: item.created_at,
                            // user: { _id: item.sender_type }


                        })
                })
            );
        }
        else {

            // set_loading(false)

        }
    };




    const getAgents = async () => {

        let res = await Api.get(`messenger/all-agents?api_key=${apiKey}`);

        if (res.code == 200) {

            let agentsList = res?.agents;
            set_agentsList(agentsList);

        }
        else {
            //     set_loading(false);

        }


    };

    const getCallsList = async () => {

        let res = await Api.get(`messenger/get-chat-calls?chat_id=${currentChatId}`);
        // console.log("calls list res===>", res)
        if (res.success == true) {

            let callsList = res?.data
            set_callsList(callsList);
            set_todayCallsCount(res?.today_calls_count)

        }
        else {
            //     set_loading(false);

        }


    };


    const joinAllAgents = async () => {

        // set_loading(true);
        let res = await Api.get(`messenger/all-agents?api_key=${apiKey}`);

        if (res.code == 200) {

            let agentsList = res?.agents;

            var agent_room = `agents_${apiKey}`;
            var sender = client_id;
            if (agentsList.length > 0) {
                for (let i = 0; i < agentsList.length; i++) {
                    var receiver = agentsList[i] ? agentsList[i].id : receiver;

                    socket.emit('agRoomJoined', agent_room, sender, receiver);


                }
                // console.log("all agents joined");

            }


        }
        else {
            //     set_loading(false);

        }


    };

    const onSend = useCallback((messages = [], navigationParams) => {

        let data = messages[0];





        sendMsg(data);
        setTextMessage('')

    }, []);

    const sendMsg = async (data) => {

        let params = { client_api: apiKey, type: 'word', chat_id: chatId, message: data?.text, client_id: client_id, sender_type: 0 }
        // setSendingMsg(true)
        setMessages(previousMessages => GiftedChat.append(previousMessages, data));
        socket.emit('agSendMessage', String(chatId), data.text, client_id, String(chatId), 'word');
        // setSendingMsg(false)

        setMessagesSeenStatus(0)
        let res = await Api.post('messenger/send-message', params);

        console.log("send txt msg res==>", res)
        if (res.success) {

            // setSendingMsg(false)

        } else {
            Helpers.showToast("Message not sent")

        }



    };

    const updateSeenStatusApi = async (SelectedChat) => {
        let params = { chat_id: SelectedChat }

        let res = await Api.post('messenger/update-all-seen-status', params);


        if (res.success) {
            // console.log('update seen status success')

        } else {



        }

    }



    const sendImgMsg = async (imgData) => {
        // set_loading(true)


        let checkSize = 3048 * 1024
        let maxAllowed = checkSize / 1024;

        if (imgData?.size <= checkSize) {

            const rand = Math.random().toString(36).slice(2);
            const date = new Date()

            const data = {
                image: imgData.path,
                user: { _id: '0' },
                createdAt: date,
                _id: rand
            }

            setMessages(previousMessages => GiftedChat.append(previousMessages, data));
            setMessagesSeenStatus(0)

            const formdata = new FormData();

            const random = Math.random().toString(36).slice(2)
            const filename = Platform.select({
                ios: imgData.filename,
                android: `image${random}.jpg`,
            });




            Helpers.showToast('Sending Image')

            setSendingMsg(true)

            formdata.append('file', {
                type: imgData.mime,
                uri: imgData.path,
                name: filename
            })
            formdata.append("client_id", client_id);
            formdata.append("type", "file");
            formdata.append("chat_id", chatId);
            // formdata.append("client_api", apiKey);
            formdata.append("api_key", apiKey);

            formdata.append("message", {
                type: imgData.mime,
                uri: imgData.path,
                name: filename
            });
            formdata.append("sender_type", 0);
            console.log("form data==>", formdata)

            const options = {
                method: 'POST',
                body: formdata,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${userToken}`
                }
            }



            fetch(`${BASE_URL}/messenger/send-message`, options)
                .then(response => response.text())
                .then(result => {
                    let res = JSON.parse(result)

                    socket.emit('agSendMessage', String(chatId), res.message, client_id, String(chatId), 'file');

                    Helpers.showToast('Image Sent')
                    setSendingMsg(false)




                })
                .catch((error) => {

                    Helpers.showToast('Image Not Sent')
                    setSendingMsg(false)


                });
        } else {
            Helpers.showToast(`Image Size is large, maximum size is ${maxAllowed} MB`)

        }


    };


    const sendVideoMsg = async (vidData) => {
        // set_loading(true)

        // const rand = Math.random().toString(36).slice(2);
        // const date = new Date()

        // const data = {
        //     image: imgData.path,
        //     user: { _id: '0' },
        //     createdAt: date,
        //     _id: rand
        // }

        // setMessages(previousMessages => GiftedChat.append(previousMessages, data));
        // setMessagesSeenStatus(0)
        const extension = vidData?.path.split('.').pop()
        const filename = vidData?.path.split('/').pop()


        if (extension == "mp4" || extension == "mkv" || extension == "webm") {
            let checkSize = 102400 * 1024
            let maxAllowed = checkSize / 1024;

            if (vidData?.size <= checkSize) {




                const formdata = new FormData();

                const random = Math.random().toString(36).slice(2)
                // const filename = Platform.select({
                //     ios: vidData.filename,
                //     android: `video${random}.${extension}`,
                // });




                Helpers.showToast('Sending Video')
                setSendingMsg(true)


                formdata.append('file', {
                    type: vidData.mime,
                    uri: vidData.path,
                    name: filename,
                    duration: vidData.duration
                })
                formdata.append("client_id", client_id);
                formdata.append("type", "file");
                formdata.append("chat_id", chatId);
                // formdata.append("client_api", apiKey);
                formdata.append("api_key", apiKey);

                formdata.append("message", {
                    type: vidData.mime,
                    uri: vidData.path,
                    name: filename,
                    duration: vidData.duration

                });
                formdata.append("sender_type", 0);
                console.log("form data==>", formdata)

                const options = {
                    method: 'POST',
                    body: formdata,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${userToken}`
                    }
                }



                fetch(`${BASE_URL}/messenger/send-message`, options)
                    .then(response => response.text())
                    .then(result => {
                        let res = JSON.parse(result)

                        socket.emit('agSendMessage', String(chatId), res.message, client_id, String(chatId), 'file');

                        Helpers.showToast('Video Sent')
                        setSendingMsg(false)

                        getMessagesBackground();
                    })
                    .catch((error) => {
                        console.log("Video not sent err==>", error)
                        Helpers.showToast('Video Not Sent')
                        setSendingMsg(false)


                    });
            } else {
                Helpers.showToast(`File Size is large ,maximum size is ${maxAllowed} MB`)

            }
        } else {
            Helpers.showToast("Supported extensions are only mp4 mkv and webm")
        }

    };





    const sendFile = async (Filedata) => {
        // set_loading(true)

        // const rand = Math.random().toString(36).slice(2);
        // const date = new Date()

        // const data = {
        //     file: Filedata.uri,
        //     user: { _id: '0' },
        //     createdAt: date,
        //     _id: rand
        // }

        // setMessages(previousMessages => GiftedChat.append(previousMessages, data));
        // setMessagesSeenStatus(0)

        const formdata = new FormData();

        // const random = Math.random().toString(36).slice(2)
        // const filename = Platform.select({
        //     ios: imgData.filename,
        //     android: `image${random}.jpg`,
        // });
        let checkSize = 4096 * 1024
        let maxAllowed = checkSize / 1024;


        if (Filedata.size <= checkSize) {





            Helpers.showToast('Sending File')
            setSendingMsg(true)


            formdata.append('file', {
                type: Filedata.type,
                uri: Filedata.uri,
                name: Filedata.name
            })
            formdata.append("client_id", client_id);
            formdata.append("type", "file");
            formdata.append("chat_id", chatId);
            // formdata.append("client_api", apiKey);
            formdata.append("api_key", apiKey);
            formdata.append("message", {
                type: Filedata.type,
                uri: Filedata.uri,
                name: Filedata.name
            });
            formdata.append("sender_type", 0);


            // console.log("form data of file==>",formdata)

            const options = {
                method: 'POST',
                body: formdata,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${userToken}`
                }
            }



            fetch(`${BASE_URL}/messenger/send-message`, options)
                .then(response => response.text())
                .then(result => {
                    let res = JSON.parse(result)
                    console.log("file sending res==>", res)
                    socket.emit('agSendMessage', String(chatId), res.message, client_id, String(chatId), 'file');

                    Helpers.showToast('File Sent')
                    setSendingMsg(false)

                    getMessagesBackground();



                })
                .catch((error) => {

                    Helpers.showToast('File Not Sent')
                    setSendingMsg(false)


                });
        } else {
            Helpers.showToast(`File Size is large maximum size is ${maxAllowed} MB`)

        }

    };



    const getPermission = async () => {

        if (Platform.OS === 'ios') {
            Geolocation.requestAuthorization('whenInUse')
            getCurrentLocation();
        }
        else {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,

                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    getCurrentLocation();

                } else {
                    // console.log('Location permission denied');
                    Alert.alert(
                        "Permissions Required",
                        `Location Permission is required, kindly allow it from settings`,
                        [
                            {
                                text: `Go to Settings`,
                                onPress: () => {
                                    Linking.openSettings();
                                }
                            },
                            {
                                text: "Cancel",
                                onPress: () => console.log("Cancel Pressed"),
                                style: "cancel",
                            },
                        ],
                        {
                            cancelable: false,
                            onDismiss: () =>
                                console.log('alert was dismissed due to tapping outside of the alert box')
                        }
                    );
                }
            } catch (err) {
                // console.warn(err);
            }
        }

    }
    const sendLocation = async (coordinates) => {
        let params = { client_api: apiKey, type: 'map', chat_id: chatId, message: coordinates, client_id: client_id, sender_type: 0 }


        const rand = Math.random().toString(36).slice(2);
        const date = new Date()
        const data = {
            location: coordinates,
            user: { _id: '0' },
            createdAt: date,
            _id: rand
        }


        setMessages(previousMessages => GiftedChat.append(previousMessages, data));
        setMessagesSeenStatus(0)



        let res = await Api.post('messenger/send-message', params);

        if (res.success) {

            Helpers.showToast('Location Sent')
            socket.emit('agSendMessage', String(chatId), coordinates, client_id, String(chatId), 'map');


        }
    }



    const sendVoiceMessage = async (voiceUrl) => {

        console.log("voice url==>", voiceUrl)

        // let dirs = RNFetchBlob.fs.dirs.MusicDir

        // console.log("voice dir==>",dirs)

        let name = voiceUrl.split('/').pop()


        console.log("name===>", name)

        setAudioStartState(null)

        const formdata = new FormData();
        const type = Platform.select({
            ios: 'audio/mpeg-3',// 'audio/x-m4a',
            android: 'audio/mpeg-3',
        })

        const url = Platform.select({
            ios: voiceUrl,
            android: voiceUrl,
        })




        formdata.append('file', {
            type: type,
            name: name,
            uri: url

        })
        formdata.append("client_id", client_id);
        formdata.append("type", "voice");
        formdata.append("chat_id", chatId);
        // formdata.append("client_api", apiKey);
        formdata.append("api_key", apiKey);

        formdata.append("sound_name", name);
        // formdata.append("message", 'bai');
        formdata.append("message", {
            type: type,
            name: name,
            uri: url
        });
        formdata.append("sender_type", 0);



        const rand = Math.random().toString(36).slice(2);
        const date = new Date()
        const data = {
            audio: voiceUrl,
            user: { _id: '0' },
            createdAt: date,
            _id: rand,
            key: rand
        }

        // if (Platform.OS == 'android') {
        setMessages(previousMessages => GiftedChat.append(previousMessages, data));
        // }
        setMessagesSeenStatus(0)


        console.log("form data===>", formdata)


        const options = {
            method: 'POST',
            body: formdata,
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${userToken}`,
                'Accept': 'application/json',

            }
        }


        Helpers.showToast('Sending Voice Message')
        setSendingMsg(true)
        console.log("options", options)
        fetch(`${BASE_URL}/messenger/send-message`, options)
            .then(response => response.text())
            .then(result => {
                let res = JSON.parse(result)
                console.log('voice chat api response==>', res)
                socket.emit('agSendMessage', String(chatId), res.message, client_id, String(chatId), 'voice');
                setSendingMsg(false)
                // if (Platform.OS == "ios") {

                //     getMessagesBackground();
                // }
                Helpers.showToast('Voice Message Sent')
                console.log("voice msg res==>", res)

            })
            .catch(error => {
                setSendingMsg(false)
                Helpers.showToast(error.toString())
                console.log('error', error)
            });

    };

    const getCurrentLocation = () => {
        // if (!mountedRef.current) return null;

        Geolocation.getCurrentPosition(position => {

            let coordinates = `{"latitude":${position.coords.latitude}, "longitude":${position.coords.longitude} }`
            Helpers.showToast('sending location')
            sendLocation(coordinates)

        },
            (error) => {
                Helpers.showToast('Network Error Location sending failed')

                // console.log("map error: ", error);
                // console.log(error.code, error.message);
            },
            { enableHighAccuracy: true, timeout: 50000, maximumAge: 1000 }
        );
    }


    const openImagePicker = async () => {

        if (Platform.OS === 'android') {
            try {
                const grants = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                ]);



                if (
                    grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
                    PermissionsAndroid.RESULTS.GRANTED &&
                    grants['android.permission.READ_EXTERNAL_STORAGE'] ===
                    PermissionsAndroid.RESULTS.GRANTED
                ) {
                    // console.log('Permissions granted');
                    ImagePicker.openPicker({

                        width: 1000,
                        height: 1000,
                        cropping: false,
                        mediaType: 'photo'
                    }).then(images => {

                        console.log("image picker==>", images)
                        if (images?.mime.includes("image/")) {
                            console.log("send image")
                            sendImgMsg(images);

                        } else if (images?.mime.includes("video/")) {
                            console.log("video")
                            sendVideoMsg(images)
                        }

                    });


                } else {
                    // Alert.alert('All required permissions not granted kindly allow it from \n App Info>Permissions');
                    Alert.alert(
                        "Permissions Required",
                        `Storage(Files and Media) Permission is required, kindly allow it from settings`,
                        [
                            {
                                text: `Go to Settings`,
                                onPress: () => {
                                    Linking.openSettings();
                                }
                            },
                            {
                                text: "Cancel",
                                onPress: () => console.log("Cancel Pressed"),
                                style: "cancel",
                            },
                        ],
                        {
                            cancelable: false,
                            onDismiss: () =>
                                console.log('alert was dismissed due to tapping outside of the alert box')
                        }
                    );
                    // goBackDispatch();

                    return;
                }
            } catch (err) {
                // console.log(err);
                return;
            }
        } else {
            checkIosMediaPermissions()
        }





    }

    const openIosImagePicker = () => {

        ImagePicker.openPicker({

            width: 1000,
            height: 1000,
            cropping: false,
            mediaType: 'photo'
        }).then(images => {
            setShowAttachmentsModal(false)
            console.log("image picker==>", images)
            if (images?.mime.includes("image/")) {
                console.log("send image")
                sendImgMsg(images);

            } else if (images?.mime.includes("video/")) {
                console.log("video")
                sendVideoMsg(images)
            }

        });

    }


    const getVoiceAndStoragePermissions = async () => {
        if (Platform.OS === 'android') {
            try {
                const grants = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                ]);



                if (
                    grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
                    PermissionsAndroid.RESULTS.GRANTED &&
                    grants['android.permission.READ_EXTERNAL_STORAGE'] ===
                    PermissionsAndroid.RESULTS.GRANTED &&
                    grants['android.permission.RECORD_AUDIO'] ===
                    PermissionsAndroid.RESULTS.GRANTED
                ) {
                    // console.log('Permissions granted');
                    sendVoice = 1
                    onStartRecord();

                } else {
                    // Alert.alert('All required permissions not granted kindly allow it from \n App Info>Permissions');
                    Alert.alert(
                        "Permissions Required",
                        `Microphone and Storage(Files and Media) Permission is required, kindly allow it from settings`,
                        [
                            {
                                text: `Go to Settings`,
                                onPress: () => {
                                    Linking.openSettings();
                                }
                            },
                            {
                                text: "Cancel",
                                onPress: () => console.log("Cancel Pressed"),
                                style: "cancel",
                            },
                        ],
                        {
                            cancelable: false,
                            onDismiss: () =>
                                console.log('alert was dismissed due to tapping outside of the alert box')
                        }
                    );
                    // goBackDispatch();

                    return;
                }
            } catch (err) {
                // console.log(err);
                return;
            }
        } else {
            checkIosMicPermissions()
        }
    }



    const getStoragePermissionsForFile = async () => {
        if (Platform.OS === 'android') {
            try {
                const grants = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                ]);



                if (
                    grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
                    PermissionsAndroid.RESULTS.GRANTED &&
                    grants['android.permission.READ_EXTERNAL_STORAGE'] ===
                    PermissionsAndroid.RESULTS.GRANTED
                ) {
                    // console.log('Permissions granted');
                    filePicker()


                } else {
                    // Alert.alert('All required permissions not granted kindly allow it from \n App Info>Permissions');
                    Alert.alert(
                        "Permissions Required",
                        `Storage(Files and Media) Permission is required, kindly allow it from settings`,
                        [
                            {
                                text: `Go to Settings`,
                                onPress: () => {
                                    Linking.openSettings();
                                }
                            },
                            {
                                text: "Cancel",
                                onPress: () => console.log("Cancel Pressed"),
                                style: "cancel",
                            },
                        ],
                        {
                            cancelable: false,
                            onDismiss: () =>
                                console.log('alert was dismissed due to tapping outside of the alert box')
                        }
                    );
                    // goBackDispatch();

                    return;
                }
            } catch (err) {
                // console.log(err);
                return;
            }
        } else {

            // IosFilePicker()
            checkIosFilePermissions()
        }
    }


    const onBlockAlert = () => {
        Alert.alert(
            "Blocking and Spaming",
            `Are you sure you want to ${spamStatus == 0 ? "Block" : "Unblock"}`,
            [
                {
                    text: `${spamStatus == 0 ? "Block" : "Unblock"}`,
                    onPress: () => {
                        blockUser();



                    }
                },
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                },
            ],
            {
                cancelable: true,
                onDismiss: () =>
                    console.log('alert was dismissed due to tapping outside of the alert box')
            }
        );
    }

    const blockUser = async () => {
        let params = {
            chat_id: currentChatId,
            visitor_id: userProps?.user_id
        }

        let res = await Api.post(`messenger/report`, params);
        console.log("res", res)
        if (res.code == 200) {
            setSpamStatus(res?.data?.spam_status)
            if (res?.data?.spam_status == 1) {
                // props.navigation.goBack()
                goBackDispatch()

                Helpers.showToast("Blocked")
            }
        }
    }


    const filePicker = async () => {
        try {


            const response = await DocumentPicker.pick({
                presentationStyle: 'fullScreen',
                type: [types.pdf, types.doc, types.docx, types.xls, types.xlsx, types.audio],
            });
            console.log("file picker response===>", response[0])
            if (response[0]) {
                sendFile(response[0])
            }
        } catch (err) {
            console.log("file picker catch err==>", err)
        }

    }

    const IosFilePicker = async () => {




        try {


            const response = await DocumentPicker.pick({
                presentationStyle: 'fullScreen',
                type: [types.pdf, types.doc, types.docx, types.xls, types.xlsx, types.audio],
            });
            console.log("file picker response===>", response[0])
            if (response[0]) {
                setShowAttachmentsModal(false)
                sendFile(response[0])
            }
        } catch (err) {
            console.log("file picker catch err==>", err)
        }

    }





    /////////////////////...............Audio...................///////////


    const checkPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const grants = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                ]);
                // console.log('write external stroage', grants);
                if (
                    grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
                    PermissionsAndroid.RESULTS.GRANTED &&
                    grants['android.permission.READ_EXTERNAL_STORAGE'] ===
                    PermissionsAndroid.RESULTS.GRANTED &&
                    grants['android.permission.RECORD_AUDIO'] ===
                    PermissionsAndroid.RESULTS.GRANTED
                ) {
                    // console.log('Permissions granted');
                    onStartRecord();
                } else {
                    // console.log('All required permissions not granted');
                    return;
                }
            } catch (err) {
                // console.warn(err);
                return;
            }
        }
    }

    var voiceName;
    var sendVoice = 0;
    // const audioRecorderPlayer = new AudioRecorderPlayer();

    const onStartRecord = async () => {
        const random = Math.random().toString(36).slice(2)

        // onStopPlay()
        Helpers.showToast("Recording Audio")



        const dirs = RNFetchBlob.fs.dirs;
        console.log("dirs", dirs)
        const path = Platform.select({
            ios: `hello${random}.aac`,
            android: `${dirs.DownloadDir}/hello${random}.mp3`,
        });

        voiceName = Platform.OS == 'ios' ? path : `hello${random}.mp3`
        //     audioRecorderPlayer.stopPlayer();
        //     audioRecorderPlayer.removePlayBackListener();
        const audioSet = {
            AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
            AudioSourceAndroid: AudioSourceAndroidType.MIC,
            AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.max,
            AVNumberOfChannelsKeyIOS: 2,
            AVFormatIDKeyIOS: AVEncodingOption.aac,
        };
        const uri = await audioRecorderPlayer.startRecorder(path, audioSet);
        audioRecorderPlayer.addRecordBackListener((e) => {
            setAudioStartState({
                recordSecs: e.currentPosition,
                recordTime: audioRecorderPlayer.mmssss(
                    // Math.floor(e.currentPosition/100),
                    // e.currentPosition/100
                    Math.floor(e.currentPosition),


                ),
            });
            // console.log('recording....', e)

            return;
        });

    };

    const onStopRecord = async () => {
        // if (sendVoice != 1) {
        //     // getVoiceAndStoragePermissions()
        //     Helpers.showToast("Please Press and Hold the record button to Record and leave to Send")
        // }


        // if (sendVoice == 1) {
        const result = await audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();
        console.log("result", result)
        sendVoiceMessage(result)
        // }
        // sendVoice = 0;
    };

    const onCancelRecord = async () => {


        setAudioStartState(null)
        const result = await audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();
        console.log("recording cancel")

    };

    const getAudioInfo = async () => { // You need the keyword `async`
        // SoundPlayer.addEventListener('FinishedLoadingURL', async ({ success }) => {
        //     console.log("FinishedLoadingURL", success)
        //     const { duration, currentTime } = await SoundPlayer.getInfo();
        //     console.log("duration", duration, currentTime)

        // })

        // SoundPlayer.addEventListener('FinishedLoadingURL', async ({ success, url }) => {
        //     console.log('finished loading url', success, url)
        //     const info = await SoundPlayer.getInfo()
        //     console.log("event",info)
        //     // SoundPlayer.play()
        //   })

        try {
            const info = await SoundPlayer.getInfo()
            console.log("info", info)
            // this.setState({ audioPlayer: { ...this.state.audioPlayer, duration: (info.duration).toFixed(2), currentTime: (info.currentTime).toFixed(2) } })

        } catch (e) {
            console.log('There is no song playing', e)
        }

        // try {
        //   const info = await SoundPlayer.getInfo() // Also, you need to await this because it is async
        //   console.log('getInfo', info) // {duration: 12.416, currentTime: 7.691}
        // } catch (e) {
        //   console.log('There is no song playing', e)
        // }
    }
    const start = async (uri) => {
        var whoosh = new Sound(uri, '', (error) => {
            if (error) {
                console.log('failed to load the sound', error);
                Helpers.showToast(error.message)
                return;
            }
            // loaded successfully
            console.log("isLoaded", whoosh.isLoaded())
            console.log("isPLaying", whoosh.isPlaying())
            // Seek to a specific point in seconds
            //    setInterval(() => {
            //     whoosh.setCurrentTime(whoosh.getDuration() - 1);
            //    }, 1000);

            // Get the current playback point in seconds
            whoosh.getCurrentTime((seconds) => console.log('at ' + seconds));


            setAudioLoader(false)
            // setAudioIsPlaying(true)

            console.log('duration in seconds: ' + whoosh.getDuration() + 'number of channels: ' + whoosh.getNumberOfChannels());
            // Play the sound with an onEnd callback
            var playTime = setInterval(() => {
                whoosh.getCurrentTime((seconds, isPlaying) => {
                    console.log("Hello", seconds, isPlaying)
                    setPlayWidth({
                        playTime: Math.floor(seconds).toPrecision(2),
                        duration: Math.floor(whoosh.getDuration()).toPrecision(2),
                    });
                })
            }, 250);

            whoosh.play((success) => {
                if (success) {
                    setCurrentPlayedMessage(null)
                    setPlayWidth({})
                    setAudioIsPlaying(false)
                    clearInterval(playTime)
                    console.log('successfully finished playing');
                } else {
                    setCurrentPlayedMessage(null)
                    setPlayWidth({})
                    setAudioIsPlaying(false)
                    clearInterval(playTime)
                    console.log('playback failed due to audio decoding errors');
                }
            });
        });

        // Reduce the volume by half
        whoosh.setVolume(100);

        // Position the sound to the full right in a stereo field
        whoosh.setPan(1);

        // Loop indefinitely until stop() is called
        whoosh.setNumberOfLoops(-1);

        // Get properties of the player instance
        console.log('volume: ' + whoosh.getVolume());
        console.log('pan: ' + whoosh.getPan());
        console.log('loops: ' + whoosh.getNumberOfLoops());


        // Pause the sound
        whoosh.pause();

        // Stop the sound and rewind to the beginning
        whoosh.stop(() => {
            // Note: If you want to play a sound after stopping and rewinding it,
            // it is important to call play() in a callback.
            whoosh.play();
        });

        // Release the audio player resource
        whoosh.release();

    };

    const onStartPlay = async (url, onDeviceUrl, resPath) => {

        console.log("9878", url, onDeviceUrl)
        var audioUrl = onDeviceUrl
        if (url.match('uploads//') || url.match('uploads/') || url.match('uploads')) {
            audioUrl = url
        }
        console.log('play url==>', audioUrl)
        setAudioIsPlaying(true)
        onStopPlay()

        if (Platform.OS == "android") {
            setTimeout(async () => {
                // setAudioIsPlaying(true)

                const msg = await audioRecorderPlayer.startPlayer(
                    // 'https://adforest-testapp.scriptsbundle.com/convertedhellojpqztgang4.mp3?_t=1663155573');
                    // 'https://s21.aconvert.com/convert/p3r68-cdx67/9q2iz-fpy9i.mp3');
                    // 'https://adforest-testapp.scriptsbundle.com/hellowq9ich6n2oa-1.mp3');
                    //'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3');
                    audioUrl);
                // 'https://gtchatpro.com/download/uploads-key_189FfPeBhiSUEYXf0QlhCUvimXHcJawVp-hellowq9ich6n2oa.mp3');
                //                    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');


                console.log("play msg", msg)
                audioRecorderPlayer.addPlayBackListener((e) => {
                    setAudioLoader(false)
                    console.log("e==>", e)
                    setPlayWidth({
                        currentPositionSec: e.currentPosition,
                        currentDurationSec: e.duration,
                        playTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
                        duration: audioRecorderPlayer.mmssss(Math.floor(e.duration)),
                    });
                    if (e.currentPosition == e.duration) {

                        setCurrentPlayedMessage(null)
                        setPlayWidth({})
                        setAudioIsPlaying(false)

                    }

                    return;
                });

            }, 500);
        }
        else {
            console.log("inelse")
            start(audioUrl);
            // SoundPlayer.playUrl(audioUrl)

        }

        // if (Platform.OS == "ios") {
        //     let dirs = RNFetchBlob.fs.dirs
        //     console.log("dirs===>", dirs)

        //     const ext = playUrl.split('.').pop()

        //     // Helpers.showToast("Downloading File...")

        //     const rand = Math.random()

        //     const configfb = {
        //         fileCache: true,
        //         useDownloadManager: true,
        //         notification: true,
        //         mediaScannable: true,
        //         title: "GTdownload_" + rand + `.${ext}`,
        //         path: dirs.DocumentDir + "/GTdownload_" + rand + `.${ext}`,
        //     }

        //     RNFetchBlob.config({
        //         // add this option that makes response data to be stored as a file,
        //         // this is much more performant.
        //         useDownloadManager: true,
        //         path: dirs.DocumentDir + "/GTdownload_" + rand + `.${ext}`,
        //         fileCache: true,
        //         appendExt: `${ext}`,
        //         description: 'Downloading File.',
        //         notification: true
        //         // IOSBackgroundTask:true
        //     }).fetch('GET', url, {
        //         //some headers ..
        //     }).then((res) => {
        //         // the temp file path
        //         console.log('The file saved to ', res.path)
        //         if (Platform.OS === "ios") {
        //             // RNFetchBlob.ios.openDocument(res.data);
        //             setCurrentPlayedMessage(null)
        //             setPlayWidth({})
        //             setAudioIsPlaying(false)
        //             RNFetchBlob.fs.writeFile(configfb.path, res.data, 'base64');
        //             RNFetchBlob.ios.previewDocument(configfb.path);
        //         }

        //     })

        // }









    };




    // const onPausePlay = async () => {
    //     await audioRecorderPlayer.pausePlayer();
    // };

    const onStopPlay = async () => {
        // console.log('onStopPlay');
        audioRecorderPlayer.stopPlayer();
        audioRecorderPlayer.removePlayBackListener();

    };


    var RNFS = require('react-native-fs');



    const downloadFile = async (url, ext, calledFrom) => {


        if (Platform.OS === 'android') {
            try {
                const grants = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                ]);



                if (
                    grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
                    PermissionsAndroid.RESULTS.GRANTED &&
                    grants['android.permission.READ_EXTERNAL_STORAGE'] ===
                    PermissionsAndroid.RESULTS.GRANTED
                ) {
                    console.log('Permissions granted');

                    let dirs = RNFetchBlob.fs.dirs
                    console.log("dirs===>", dirs)

                    Helpers.showToast("Downloading File...")
                    calledFrom == "audio" ? setShowAudioLoader(true) : setFileLoader(true)

                    const rand = Math.random()

                    RNFetchBlob.config({
                        // add this option that makes response data to be stored as a file,
                        // this is much more performant.
                        useDownloadManager: true,
                        path: Platform.OS == "android" ? dirs.DownloadDir : dirs.DocumentDir + "/GTdownload_" + rand + `.${ext}`,
                        addAndroidDownloads: {
                            useDownloadManager: true, // true will use native manager and be shown on notification bar.
                            notification: true,
                            path: Platform.OS == "android" ? dirs.DownloadDir + `/${rand}` + `.${ext}` : dirs.DocumentDir + "/GTdownload_" + rand + `.${ext}`,
                            description: 'Downloading.',
                            title: "GTdownload_" + rand + `.${ext}`
                        },
                        fileCache: true,
                        appendExt: `${ext}`,
                        description: 'Downloading File.'
                    }).fetch('GET', url, {
                        //some headers ..
                    }).then((res) => {
                        calledFrom == "audio" ? setShowAudioLoader(false) : setFileLoader(false)

                        // the temp file path
                        console.log('The file saved to ', res)
                        Helpers.showToast('Successfully Downloaded')
                    })


                } else {
                    // Alert.alert('All required permissions not granted kindly allow it from \n App Info>Permissions');
                    Alert.alert(
                        "Permissions Required",
                        `All required permissions not granted kindly allow it from settings`,
                        [
                            {
                                text: `Go to Settings`,
                                onPress: () => {
                                    Linking.openSettings();
                                }
                            },
                            {
                                text: "Cancel",
                                onPress: () => console.log("Cancel Pressed"),
                                style: "cancel",
                            },
                        ],
                        {
                            cancelable: false,
                            onDismiss: () =>
                                console.log('alert was dismissed due to tapping outside of the alert box')
                        }
                    );
                    // goBackDispatch();

                    return;
                }
            } catch (err) {
                // console.log(err);
                return;
            }
        } else {
            let dirs = RNFetchBlob.fs.dirs
            console.log("dirs===>", dirs)

            Helpers.showToast("Downloading File...")
            // set_loading(true)
            calledFrom == "audio" ? setShowAudioLoader(true) : setFileLoader(true)
            const rand = Math.random()

            const configfb = {
                fileCache: true,
                useDownloadManager: true,
                notification: true,
                mediaScannable: true,
                title: "GTdownload_" + rand + `.${ext}`,
                path: dirs.DocumentDir + "/GTdownload_" + rand + `.${ext}`,
            }

            RNFetchBlob.config({
                // add this option that makes response data to be stored as a file,
                // this is much more performant.
                useDownloadManager: true,
                path: dirs.DocumentDir + "/GTdownload_" + rand + `.${ext}`,
                addAndroidDownloads: {
                    useDownloadManager: true, // true will use native manager and be shown on notification bar.
                    notification: true,
                    path: dirs.DocumentDir + "/GTdownload_" + rand + `.${ext}`,
                    description: 'Downloading.',
                    title: "GTdownload_" + rand + `.${ext}`
                },

                fileCache: true,
                appendExt: `${ext}`,
                description: 'Downloading File.',
                notification: true
                // IOSBackgroundTask:true
            }).fetch('GET', url, {
                //some headers ..
            }).then((res) => {
                // the temp file path
                calledFrom == "audio" ? setShowAudioLoader(false) : setFileLoader(false)
                console.log('The file saved to ', res.path)
                Helpers.showToast('Successfully Downloaded')
                if (Platform.OS === "ios") {
                    // RNFetchBlob.ios.openDocument(res.data);
                    RNFetchBlob.fs.writeFile(configfb.path, res.data, 'base64');
                    RNFetchBlob.ios.previewDocument(configfb.path);
                }

            })

        }

        // let dirs = RNFetchBlob.fs.dirs
        // // console.log("dirs===>", dirs)
        // Helpers.showToast("Downloading File...")

        // RNFetchBlob.config({
        //     // add this option that makes response data to be stored as a file,
        //     // this is much more performant.
        //     useDownloadManager: true,
        //     path: dirs.DownloadDir + "/GTdownload_" + Math.random() + `.${ext}`,
        //     addAndroidDownloads: {
        //         useDownloadManager: true, // true will use native manager and be shown on notification bar.
        //         notification: true,
        //         path: dirs.DownloadDir + "/GTdownload_" + Math.random() + `.${ext}`,
        //         description: 'Downloading.',
        //     },
        //     fileCache: true,
        //     appendExt: `${ext}`,
        //     description: 'Downloading File.'
        // }).fetch('GET', url, {
        //     //some headers ..
        // }).then((res) => {
        //     // the temp file path
        //     console.log('The file saved to ', res)
        //     // onStartPlay('','',res.path())
        // })
    }








    ///////////////................End Audio...................///////////




    const renderBubble = (props) => {
        const { currentMessage } = props;

        // console.log("current msg===>", currentMessage)

        if (currentMessage.location) {
            let time = moment(currentMessage.createdAt).format('hh:mm A')

            return (
                <View style={{ bottom: hp(2) }}>
                    <View  >
                        <LocationView location={currentMessage.location} style={{ bottom: hp(2), top: hp(2) }} />


                    </View>
                    <View style={{ height: hp(2), width: wp(70), alignItems: currentMessage.user._id == "0" ? 'flex-end' : 'flex-start', paddingHorizontal: wp(2) }} >
                        <Text
                            style={{
                                color: Helpers.Colors.lightTxt,
                                fontSize: 10,


                            }}
                        >{time}</Text>
                    </View>

                </View>
            );
        }
        if (currentMessage.audio) {

            let time = moment(currentMessage?.createdAt).format('hh:mm A')
            // console.log("current audio msg==>",currentMessage)

            const icon = (audioLoader && props.currentMessage.key === currentPlayedMessage) ? <ActivityIndicator size="large" color={Helpers.Colors.light} /> : <Icon key={currentMessage.key} name={'play-arrow'} size={30} type="material" color={"white"}
                onPress={() => {
                    setAudioLoader(true)
                    onStartPlay(currentMessage.audio, currentMessage.audio)
                    setCurrentPlayedMessage(currentMessage.key)
                }}
                style={{}}
            />
            // const icon = audioLoader? <ActivityIndicator size="small" color={Helpers.Colors.light} />: <Icon key={currentMessage.key} name={'play-arrow'} size={30} type="material" color={"white"} style={{}} />
            const icon2 = <Icon key={currentMessage.key} name={'ios-stop-circle-outline'} size={30} type="ionicon" color={'red'} style={{}}
                onPress={() => {
                    setAudioLoader(false)
                    setCurrentPlayedMessage(null)
                    setAudioIsPlaying(false)
                    onStopPlay()
                }}
            />
            // console.log("Duration===>",playWidth.playTime)
            const text1 = <Text>{playWidth.playTime}/{playWidth.duration}</Text>
            const text2 = <Text> {"00:00"}/{"00:00"}</Text>
            return (
                <View style={{ bottom: hp(1.5) }}>
                    <View style={{ height: hp(5), width: wp(60), backgroundColor: currentMessage.user._id == "0" ? Helpers.Colors.primary : '#88CFFC', borderRadius: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} >
                        <TouchableOpacity key={currentMessage.key} onPress={() => {

                            // setAudioLoader(true)


                            // onStartPlay(currentMessage.audio, currentMessage.audio)
                            // setCurrentPlayedMessage(currentMessage.key)


                        }} >
                            {(props.currentMessage.key === currentPlayedMessage && !audioLoader) ? icon2 : icon}
                        </TouchableOpacity>
                        <View style={{ height: hp(4), width: wp(40), alignItems: 'center', justifyContent: 'center' }} >

                            {(props.currentMessage.key === currentPlayedMessage && !audioLoader) ? text1 : text2}

                        </View>
                        {currentMessage.user._id == "1" ?
                            showAudioLoader ? <ActivityIndicator color={Helpers.Colors.primary} size='small' /> : <Icon name={"file-download"} type={"material"} size={hp(3.5)} color={"#333"} onPress={() => downloadFile(currentMessage?.audio, currentMessage?.extension, 'audio')} />
                            :
                            null}
                    </View>
                    <View style={{ height: hp(2), alignItems: currentMessage.user._id == "0" ? 'flex-end' : 'flex-start', paddingHorizontal: wp(2) }} >
                        <Text
                            style={{
                                color: Helpers.Colors.lightTxt,
                                fontSize: 10,


                            }}
                        >{time}</Text>
                    </View>
                </View>
            )
        }


        if (currentMessage.file) {

            let time = moment(currentMessage?.createdAt).format('hh:mm A')

            var iconName;
            var iconType = "ant-design"
            if (currentMessage.extension == "mp4" || currentMessage.extension == "mkv" || currentMessage.extension == "webm") {
                iconName = "videocamera"

            } else if (currentMessage.extension == "doc" || currentMessage.extension == "docs" || currentMessage.extension == "docx") {
                iconName = "wordfile1"
            } else if (currentMessage.extension == "xls" || currentMessage.extension == "xlsx" || currentMessage.extension == "xlx") {
                iconName = "file-excel-o"
                iconType = "font-awesome"
            } else if (currentMessage.extension == "pdf") {
                iconName = "pdffile1"
            } else if (currentMessage.extension == "ogg" || currentMessage.extension == "wav") {
                iconName = "file-audio-o"
                iconType = "font-awesome"
            }

            // if (Platform.OS == "ios") {
            //     if (currentMessage.extension == "ogg" || currentMessage.extension == "wav" || currentMessage.extension == "m4a" || currentMessage.extension == "mp3") {
            //         iconName = "file-audio-o"
            //         iconType = "font-awesome"
            //     }
            // }

            return (
                <View style={{ bottom: hp(1.5) }}>
                    <View style={{ height: hp(10), width: wp(45), backgroundColor: currentMessage.user._id == "0" ? Helpers.Colors.primary : "#88CFFC", borderTopLeftRadius: 5, borderTopRightRadius: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} >
                        <Icon name={iconName} type={iconType} size={hp(5)} color={"#333"} />


                    </View>
                    <TouchableOpacity key={currentMessage.key} onPress={() => {
                        downloadFile(currentMessage?.file, currentMessage?.extension, 'file')
                    }}
                        style={{ height: hp(5), width: wp(45), backgroundColor: currentMessage.user._id == "0" ? 'rgb(60, 141, 122)' : "#092869", alignItems: 'center', justifyContent: 'center' }}
                    >
                        {showFileLoader ? <ActivityIndicator size={'small'} color={Helpers.Colors.primary} /> : <Text style={{ color: "white" }}>Download</Text>}


                    </TouchableOpacity>
                    <View style={{ height: hp(2), alignItems: currentMessage.user._id == "0" ? 'flex-end' : 'flex-start', paddingHorizontal: wp(2) }} >
                        <Text
                            style={{
                                color: Helpers.Colors.lightTxt,
                                fontSize: 10,


                            }}
                        >{time}</Text>
                    </View>
                </View>
            )
        }

        return (
            <View>
                <Bubble

                    {...props}


                    wrapperStyle={{
                        right: {
                            backgroundColor: Helpers.Colors.primary,
                            marginBottom: hp(6),
                            borderBottomRightRadius: 0,
                            borderBottomLeftRadius: 5,
                            borderTopRightRadius: 5,
                            borderTopLeftRadius: 5,


                        },
                        left: {
                            backgroundColor: Helpers.Colors.inputFieldBg,
                            marginBottom: hp(5),
                            borderBottomRightRadius: 5,
                            borderBottomLeftRadius: 5,
                            borderTopRightRadius: 5,
                            borderTopLeftRadius: 0,
                        }
                    }}
                    textStyle={{


                        right: {
                            color: Helpers.Colors.light

                        },

                    }}
                    timeTextStyle={{
                        right: {
                            color: Helpers.Colors.lightTxt,
                            marginBottom: hp(-6),
                            marginTop: hp(1.5)

                        },
                        left: {

                            color: Helpers.Colors.lightTxt,
                            marginBottom: hp(-6),
                            marginTop: hp(1)

                        }
                    }}

                />
            </View>
        );
    };


    const customtInputToolbar = props => {

        if (socketConnected) {
            if (isAcceptedSocket == true) {
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                }).start();

                return (
                    <Animated.View style={{ backgroundColor: 'grey', width: wp(100), height: hp(10), paddingVertical: hp(2), paddingHorizontal: hp(5), borderRadius: 15, alignItems: 'center', position: 'absolute', justifyContent: 'center', opacity: fadeAnim, }}>
                        <Text style={{ color: 'white', fontSize: hp(1.9) }} >Chat is accepted by another agent and will remove in 4 seconds </Text>

                    </Animated.View>
                )
            }

            if (spamStatus == 1) {

                return (
                    <View style={{ backgroundColor: 'grey', width: wp(100), height: hp(10), paddingVertical: hp(2), paddingHorizontal: hp(5), borderRadius: 15, alignItems: 'center', position: 'absolute', justifyContent: 'center', }}>
                        <Text style={{ color: 'white', fontSize: hp(1.9) }} >Current User is Blocked </Text>

                    </View>
                )
            }

            if (chatAccept == false && userProps.accepted_by == null) {


                return (
                    <View style={{ backgroundColor: 'white', width: wp(100), height: hp(15), marginTop: hp(-2), paddingTop: hp(1), borderTopLeftRadius: 15, borderTopRightRadius: 15 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>

                            <TouchableOpacity style={styles.primaryToucable}
                                onPress={() => { acceptChatApi() }}
                            >
                                <Text style={{ color: 'white', fontSize: hp('2') }} > {"Start Chat"}</Text>
                            </TouchableOpacity>


                            <TouchableOpacity style={styles.secondaryTouchable}
                                onPress={RejectChatFunc}
                            >
                                <Text style={{ color: 'white', fontSize: hp('2') }} > {"Reject Chat"}</Text>
                            </TouchableOpacity>

                        </View>

                    </View>

                );
            } if (audioStartState != null) {
                return (
                    <View style={{ backgroundColor: Helpers.Colors.inputFieldBg, width: wp(100), height: hp(7), paddingHorizontal: hp(5), alignItems: 'center', flexDirection: 'row', top: hp(-2), justifyContent: 'space-between' }}>
                        <View>
                            {/* <Text style={{ color: Helpers.Colors.lightTxt, fontSize: hp(2) }} >  {audioStartState?.recordTime}  Recording.... </Text> */}

                            <Text style={{ color: Helpers.Colors.lightTxt, fontSize: hp(2) }} >  {audioStartState?.recordTime.substring(0, 5)}  Recording.... </Text>
                        </View>
                        <View style={{ flexDirection: 'row', left: wp(3) }} >
                            <TouchableOpacity style={{ flexDirection: 'row', width: wp(12), alignItems: 'center', justifyContent: 'center' }}
                                onPress={onCancelRecord}
                            >
                                <Icon name='delete' size={25} type="material-community" color={"red"} style={{ marginBottom: hp(0.5), }} />
                            </TouchableOpacity>


                            <TouchableOpacity style={{ flexDirection: 'row', width: wp(12), alignItems: 'center', justifyContent: 'center' }}
                                onPress={onStopRecord}
                            >
                                <Icon name='send-circle' size={32} type="material-community" color={Helpers.Colors.primary} style={{ marginBottom: hp(0.5) }} />
                            </TouchableOpacity>
                        </View>

                    </View>
                )
            } else {


                return (
                    <>
                        {
                            messagesSeenStatus == 1 && (
                                <Text style={{ bottom: hp(4), color: 'grey', fontSize: 11, left: wp(88) }}>Seen</Text>

                            )

                        }
                        <InputToolbar
                            {...props}


                            containerStyle={{

                                alignItems: 'center',
                                borderRadius: hp(0.5),
                                margin: hp(0.5),
                                // padding: (1),
                                borderTopWidth: 0,
                                marginLeft: hp(2),
                                marginRight: wp(1),
                                backgroundColor: Helpers.Colors.inputFieldBg,

                            }}


                        />
                    </>
                );
            }

        }
        else if (socketConnected == false) {
            return (
                <View style={{ backgroundColor: Helpers.Colors.primary, width: wp('90'), height: wp('10'), margin: wp('5'), padding: wp('1'), borderRadius: wp('1'), alignItems: 'center', position: 'absolute', justifyContent: 'center', flexDirection: 'row' }}>
                    <Text style={{ color: 'white', fontSize: hp(1.8) }} >{socketDisconnectText} </Text>
                    <ActivityIndicator size="small" color={"white"} style={{ right: wp(-5) }} />


                </View>
            )
        }
    };

    // const hideCallModal = () => {
    //     setSelectedDate(null)
    //     setPhoneNumber(null)
    //     setShowCallModal(false)
    // }
    const handleConfirmDate = (date) => {

        var nowDate = new Date();

        var nowTime = nowDate.getTime();
        var selectedTime = date.getTime();


        if (nowTime >= selectedTime) {
            alert("Cannot select current or previous time \n Please select another time")
            setShowDate(false)

            return false;
        }

        const d = new Date(date)
        var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
        var am_pm = date.getHours() >= 12 ? "PM" : "AM";

        const dateStr = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${hours}:${d.getMinutes()} ${am_pm}`
        setSelectedDate(dateStr);
        setShowDate(false)


    }





    const renderMessageAudio = props => {
        const { currentMessage } = props;
        // console.log('audio Props', currentMessage.audio)
        return (
            <></>

        );
    };

    const renderSend = (props) => {



        return (

            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', alignContent: 'center' }}>
                <View style={{ flexDirection: 'row', marginRight: wp(-2), alignItems: 'center' }}>
                    {/* <TouchableOpacity onPress={openImagePicker} >
                        <Icon name='camera' size={20} type="material-community" color={Helpers.Colors.primary} style={{}} />
                    </TouchableOpacity> */}
                    <TouchableOpacity
                        onPress={() => {

                            setShowAttachmentsModal(true)

                        }} >
                        <Icon name='attachment' size={23} type="entypo" color={Helpers.Colors.primary} style={{ marginLeft: wp(2), }} />
                    </TouchableOpacity>

                    {/* .................Audio Test.............. */}
                    <Pressable onPress={() => {

                        // if(toggleRecorder){

                        // }else{
                        getVoiceAndStoragePermissions()
                        console.log("mic pressed")
                        // }



                    }}
                        //    onPressIn={()=>{toggleVoiceRecordIcon()}}
                        delayLongPress={500}
                        style={{ width: wp(10), height: hp(4), alignItems: 'center', justifyContent: 'center' }}
                        // onLongPress={() => {

                        //     getVoiceAndStoragePermissions()


                        //     // onStartRecord();
                        // }}
                        // onPressOut={() => {
                        //     // console.log('press out')

                        //     onStopRecord();
                        // }}
                        disabled={audioIsPlaying}

                    >
                        <Icon name={audioIsPlaying == false ? 'keyboard-voice' : 'md-mic-off-circle-outline'} size={23} type={audioIsPlaying == false ? 'material' : 'ionicon'} color={audioIsPlaying == false ? Helpers.Colors.primary : 'grey'} style={{ marginLeft: wp(2), }} />
                    </Pressable>






                    {/* ..............>END................. */}

                </View>
                <Send {...props}
                    containerStyle={{ justifyContent: 'center', alignItems: 'center', alignContent: 'center', width: wp(8), height: wp(8) }}
                >
                    <View style={{ justifyContent: 'center', alignItems: 'center', alignContent: 'center' }}>
                        <Icon name='send-circle' size={wp(8)} type="material-community" color={Helpers.Colors.primary} style={{ alignSelf: 'center' }} />
                    </View>

                </Send>
            </View>

        );

    };
    const renderAvatar = (props) => {

        return (

            <View style={{ marginBottom: hp(4.5), alignItems: 'center', justifyContent: 'center' }} >
                {/* <Avatar source={{ uri: item.avatar }} rounded size={'medium'} /> */}

                <Avatar rounded size={'medium'} source={props.position == 'left' ? { uri: ParamsAvatar } : Helpers.Images.profileLogo} resizeMode="contain" style={{ width: props.currentMessage.user._id == "0" ? hp(4.7) : hp(4), height: props.currentMessage.user._id == "0" ? hp(4.7) : hp(4), marginLeft: wp(2) }} />
            </View>
        );
    };


    const renderSending = () => {
        return (
            <ActivityIndicator color={Helpers.Colors.primary} size='large' style={{ right: hp(2) }} />
        )
    }



    const renderTypingFooter = () => {
        if (visitorIsTyping) {
            return (
                <View style={{ flexDirection: 'row' }}>
                    <FastImage
                        source={{ uri: ParamsAvatar }}
                        style={{ width: wp(12), height: hp(6), marginHorizontal: wp(3.5), opacity: 0.4 }}
                        resizeMode="contain"
                    />
                    <View style={{
                        backgroundColor: Helpers.Colors.inputFieldBg,
                        marginBottom: hp(5),
                        borderBottomRightRadius: 5,
                        borderBottomLeftRadius: 5,
                        borderTopRightRadius: 5,
                        borderTopLeftRadius: 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: wp(65),
                        flexWrap: 'wrap',
                        padding: wp(2)
                    }}>
                        <Text style={{ color: Helpers.Colors.gryBack, fontWeight: '400', fontSize: 16, }} >{visitorIsTypingMsg}</Text>
                    </View>
                </View>
            );
        } else {
            return null
        }
    }





    const routeItem = props.route.params.item;
    return (

        <View style={styles.container}>

            <View style={styles.headerVw}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() =>
                        // props.navigation.goBack()
                        goBackDispatch()

                    }>
                        <Icon name="arrowleft" type="antdesign" size={20} />
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row' }} >
                        <Avatar rounded size={'medium'} source={{ uri: ParamsAvatar }} resizeMode="contain" style={{ width: hp(6), height: hp(6), marginLeft: wp(2), borderRadius: hp(6) / 2 }} />
                        {onlineStatus == 1 && (<Badge
                            status="success"
                            containerStyle={{ position: 'relative', top: hp(4.3), right: hp(1), }} />)}
                    </View>
                    <View style={{ marginStart: hp(1) }}>
                        <View>
                            <Text style={{ fontSize: 14, color: Helpers.Colors.dark, fontWeight: '700' }}>{routeItem?.visitor?.name ? routeItem?.visitor?.name : routeItem.user_id}</Text>
                            <Text style={{ color: Helpers.Colors.lightTxt, fontSize: hp(1.2) }} >{userProps?.channel}</Text>
                        </View>
                        <View>
                            {/* <Text style={{ fontSize: 10, color: Helpers.Colors.lightTxt, marginTop: hp(0.5) }}>Lase seen 3 hours ago</Text> */}
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', left: hp(1) }}>

                    {/* <TouchableOpacity style={{ width: wp(10), height: hp(5), alignItems: 'center', justifyContent: 'center' }}
                        onPress={() => { closeChat(currentChatId, userProps?.user_id) }}
                    >
                        <Icon name="chat-remove" type="material-community" size={16} color={closeChatFlag ? "#ddd" : "black"} />
                    </TouchableOpacity>
*/}

                    <TouchableOpacity
                        style={{ width: wp(9), height: hp(5), alignItems: 'center', justifyContent: 'center' }}
                        onPress={() => { setAgentsModalVisible(true) }}

                        disabled={!socketConnected}

                    >
                        <Icon name="share" type="font-awesome" size={16} color={socketConnected ? "black" : "grey"} />
                    </TouchableOpacity>

                    {/* 
                    {Platform.OS=="ios"&&<TouchableOpacity style={{ width: wp(9), height: hp(5), alignItems: 'center', }}
                        onPress={() => setShowCallModal(true)}
                        disabled={!socketConnected}
                    >
                        <View style={{height:hp(1.3),width:hp(2),top:hp(0),left:wp(2)}} > 
                        <Text style={{color:'red',fontSize:hp(1.3)}} >(1)</Text> 
                        </View>
                        <Icon name="md-call-sharp" type="ionicon" size={16} color={socketConnected ? "black" : "grey"} />

                    </TouchableOpacity>} */}


                    <TouchableOpacity style={{ width: wp(7), height: hp(5), alignItems: 'center', justifyContent: 'center' }}
                        disabled={!socketConnected}

                        onPress={() => {
                            setMenuVisible(true)
                        }} >
                        <Icon name="dots-three-vertical" type="entypo" size={18} color={socketConnected ? "black" : "grey"} />
                    </TouchableOpacity>

                    <Menu
                        visible={menuVisible}
                        // visible={true}
                        onRequestClose={() => { setMenuVisible(false) }}
                        style={{ position: 'absolute', paddingHorizontal: wp(2) }}
                    >
                        <MenuItem
                            textStyle={styles.menuItemStyle}
                            onPress={() => { closeChat(currentChatId, userProps?.user_id) }}
                        ><Icon name="chat-remove" type="material-community" size={15} color={closeChatFlag ? "#ddd" : "rgba(0,0,0,1)"} />  Close</MenuItem>

                        {/* <MenuItem
                            textStyle={styles.menuItemStyle}
                            onPress={() => {
                                setMenuVisible(false)
                                setTimeout(() => {
                                    
                                    setAgentsModalVisible(true)
                                }, 2000);
                                
                            }}
                        ><Icon name="share" type="font-awesome" size={16} style={{}} />  Transfer</MenuItem>  */}



                        <MenuItem
                            textStyle={styles.menuItemStyle}
                            onPress={() => {
                                setMenuVisible(false)
                                setTimeout(() => {

                                    setShowCallModal(true)
                                }, 600);
                            }}
                        ><View style={{ flexDirection: 'row' }}
                        >
                                <Icon name="md-call-sharp" type="ionicon" size={16} style={{}} />
                                <Text style={styles.menuItemStyle}>      Calls</Text>
                                {todayCallsCount != 0 && (<Text style={{ color: 'red', fontWeight: '500', left: wp(2) }} >({todayCallsCount})</Text>)}
                            </View> </MenuItem>

                        <MenuItem
                            textStyle={styles.menuItemStyle}
                            onPress={() => {
                                onBlockAlert()
                                setMenuVisible(false)
                            }}
                        ><Icon name="block-helper" type="material-community" size={15} color={closeChatFlag ? "#ddd" : "black"} />  {spamStatus == 0 ? "Block" : "Unblock"}</MenuItem>

                    </Menu>
                    <View style={{ width: wp(3) }} />


                </View>
            </View>

            {loading ? <Helpers.Indicator color={Helpers.Colors.primary} style={{ height: hp(100), width: wp(100), backgroundColor: 'rgba(0, 0, 0, 0.1)', position: 'absolute', zIndex: 1 }} /> : <>

                <GiftedChat
                    messages={messages}
                    // key={client_id}
                    // onSend={messages => onSend(messages)}
                    timeTextStyle={{ left: { color: Helpers.Colors.darkgreen }, right: { color: Helpers.Colors.dark }, }}
                    alwaysShowSend
                    // showAvatarForEveryMessage={true}
                    // showUserAvatar={true}
                    renderBubble={renderBubble}
                    renderSend={sendingMsg == true ? renderSending : renderSend}
                    // renderSend={renderSend}
                    onSend={text => onSend(text)}
                    renderInputToolbar={props => customtInputToolbar(props)}
                    renderFooter={renderTypingFooter}
                    renderMessageAudio={renderMessageAudio}
                    renderAvatar={props => renderAvatar(props)}
                    renderActions={() => (

                        <TouchableOpacity style={{ padding: hp(0.5), marginBottom: hp(1.5) }} onPress={() => {
                            // console.log("Smiley pressed")
                            toggleEmojiBoard()

                        }} >
                            <Icon name="smile-o" type="font-awesome" size={18} />
                        </TouchableOpacity>

                    )}
                    keyboardShouldPersistTaps='never'
                    user={{ _id: '0' }}
                    textInputStyle={{ width: '90%', color: 'black' }}
                    text={textMessage}
                    onInputTextChanged={(text) => {
                        setTextMessage(text.trimLeft())
                        onStartTyping(text)
                        setShowEmojiBoard(false)
                    }}
                    shouldUpdateMessage={(props, nextProps) => { return props.currentMessage.audio == nextProps.currentMessage.audio ? true : false }}


                />
            </>}


            {/* <View style={{height:hp(60),width:wp(100)}}> */}
            {showEmojiBoard && (

                <EmojiInput
                    onEmojiSelected={(emoji) => {
                        setTextMessage(textMessage + emoji.char)
                    }}
                    width={wp(100)}
                    numColumns={6}
                    showCategoryTab={false}
                    categoryLabelHeight={50}
                    categoryLabelTextStyle={{ fontSize: 15 }}
                    emojiFontSize={30}
                    enableSearch={false}

                />
            )}

            <Modal
                isVisible={showAttachmentsModal}
                backdropOpacity={0.1}
                onBackdropPress={() => { setShowAttachmentsModal(false) }}
                onBackButtonPress={() => { setShowAttachmentsModal(false) }}
            >
                <View style={{ height: hp(20), width: wp(93), backgroundColor: '#F0FCF3', top: hp(35), left: wp(-2), borderRadius: 10, padding: hp(4) }} >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ height: hp(9), width: hp(9), alignItems: 'center' }}>
                            <TouchableOpacity style={{ height: hp(6), width: hp(6), backgroundColor: 'purple', borderRadius: 100, alignItems: 'center', justifyContent: 'center' }}
                                onPress={() => {
                                    if (Platform.OS == "android") {

                                        setShowAttachmentsModal(false)
                                    }
                                    openImagePicker()
                                }}
                            >
                                <Icon name="image" type="entypo" size={20} color={"white"} />
                            </TouchableOpacity>
                            <Text style={{ fontSize: hp(1.7), color: Helpers.Colors.lightTxt, top: hp(0.7) }} >Media</Text>
                        </View>
                        {/* 
                        <View style={{ height: hp(9), width: hp(9), alignItems: 'center' }}>
                            <TouchableOpacity style={{ height: hp(8), width: hp(8), backgroundColor: '#BA202C', borderRadius: 100, alignItems: 'center', justifyContent: 'center' }}
                                onPress={openVideoPicker}

                            >
                                <Icon name="perm-media" type="material" size={27} color={"white"} />

                            </TouchableOpacity>
                            <Text style={{ fontSize: hp(1.7), color: Helpers.Colors.lightTxt }} >Media</Text>
                        </View> */}

                        <View style={{ height: hp(9), width: hp(9), alignItems: 'center' }}>
                            <TouchableOpacity style={{ height: hp(6), width: hp(6), backgroundColor: '#BA202C', borderRadius: 100, alignItems: 'center', justifyContent: 'center' }}
                                onPress={() => {
                                    setShowAttachmentsModal(false)
                                    getPermission()
                                }}
                            >
                                <Icon name="location" type="entypo" size={20} color={"white"} />

                            </TouchableOpacity>
                            <Text style={{ fontSize: hp(1.7), color: Helpers.Colors.lightTxt, top: hp(0.7) }} >Location</Text>
                        </View>

                        <View style={{ height: hp(9), width: hp(9), alignItems: 'center' }}>
                            <TouchableOpacity style={{ height: hp(6), width: hp(6), backgroundColor: '#044280', borderRadius: 100, alignItems: 'center', justifyContent: 'center' }}
                                onPress={() => {
                                    if (Platform.OS == "android") {

                                        setShowAttachmentsModal(false)
                                    }
                                    getStoragePermissionsForFile()
                                }}
                            >
                                <Icon name="document" type="ionicon" size={20} color={"white"} />
                            </TouchableOpacity>
                            <Text style={{ fontSize: hp(1.7), color: Helpers.Colors.lightTxt, top: hp(0.7) }} >File</Text>
                        </View>

                    </View>


                    {/* 
                    <View style={{ flexDirection: 'row', top: hp(5), }}>
            

                        <View style={{ height: hp(9), width: hp(9), alignItems: 'center', left: hp(4.5) }}>
                            <TouchableOpacity style={{ height: hp(8), width: hp(8), backgroundColor: '#917E06', borderRadius: 100, alignItems: 'center', justifyContent: 'center' }}

                                onPress={audioFilePicker}


                            >
                                <Icon name="headphones" type="feather" size={27} color={"white"} />

                            </TouchableOpacity>
                            <Text style={{ fontSize: hp(1.7), color: Helpers.Colors.lightTxt }} >Audio</Text>
                        </View>





                    </View> */}




                </View>
            </Modal>

            {/* <View style={{ alignItems: 'center', justifyContent: 'center' ,backgroundColor:'grey'}}> */}

            {/* </View> */}




            {/* </View> */}
            <AgentsModal
                isModalVisible={isAgentsModalVisible}
                close={setAgentsModalVisible}
                itemsList={userProps}
                agentsList={agentsList}
            />

            <CallsModal
                isModalVisible={showCallModal}
                close={setShowCallModal}
                itemsList={userProps}
                callsList={callsList}
                callsListApi={getCallsList}





            />
        </View>
    );

};
export default Chat;

const styles = StyleSheet.create({

    container: { flex: 1, backgroundColor: Helpers.Colors.light },
    headerVw: { width: '100%', height: hp(10), padding: wp(3), backgroundColor: Helpers.Colors.inputFieldBg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    callModal: {
        // height:hp(20),
        flex: 1
        // backgroundColor:'white'
    },
    callModalMainView: {
        backgroundColor: 'white',
        width: wp(100),
        height: hp(35),
        marginLeft: wp(-5),
        // marginTop: hp(85),
        paddingVertical: hp(6),
        // borderTopLeftRadius: 15, 
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    phoneNumTextInput: {
        borderColor: 'grey',
        borderWidth: 0.5,
        // borderRadius:10,
        width: wp(45),
        marginHorizontal: wp(3),
        fontSize: 12,
        marginTop: Platform.OS == 'android' ? hp(0) : hp(0),
        color: 'black',
        height: hp(4)

    },
    phoneNumText: {
        fontSize: 14,
        color: 'black',

    },
    inputTxt: {
        width: wp('60'), height: hp(6),
        backgroundColor: Helpers.Colors.inputFieldBg,
        marginTop: hp(1),
        marginBottom: hp(1),
        borderRadius: hp(1),
        padding: wp(2),
        color: 'black',

    },

    dateTouchable: {
        height: hp(3),
        width: wp(20),
        backgroundColor: Helpers.Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },
    dateTouchableText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '700'
    },
    dateTextView: {
        backgroundColor: '#e6e6e6',

        marginRight: wp(10),
        height: hp(3.5),
        width: wp(40),
        alignItems: 'center',
        justifyContent: 'center',



    },
    primaryToucable: {
        width: wp(40),
        height: hp(5),
        backgroundColor: Helpers.Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        // elevation: 2,
        marginHorizontal: wp(2.5),
        //    marginTop:hp(5)
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,

    },
    secondaryTouchable: {
        width: wp(40),
        height: hp(5),
        backgroundColor: '#B8B8B8',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        //    elevation: 2,
        marginHorizontal: wp(2.5),
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,

        //    marginTop:hp(5)

    },

    viewBar: {
        backgroundColor: '#ccc',
        height: 4,
        alignSelf: 'stretch',
    },
    viewBarPlay: {
        backgroundColor: 'white',
        height: 4,
        width: 0,
    },
    primaryToucable: {
        width: wp(42),
        height: hp(5),
        backgroundColor: Helpers.Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        //     elevation: 2
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },
    secondaryTouchable: {
        width: wp(42),
        height: hp(5),
        backgroundColor: '#B8B8B8',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        left: wp(2),
        //    elevation: 2
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,


        elevation: 5,

    },
    menuItemStyle: {
        color: 'black',
    }

});