import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import * as Helpers from "../../assets/Exporter";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import { Avatar, Badge } from "react-native-elements";

import { useSelector, useDispatch } from "react-redux";
import Api from "../../network/Api";
import {
  LocalNotification,
  ClearNotification,
} from "../../notificatonHandler/LocalPushController";

import io from "socket.io-client";
import FastImage from "react-native-fast-image";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { allActions } from "../../store/actions/allActions";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import messaging from "@react-native-firebase/messaging";
import { useRoute } from "@react-navigation/native";
import { ContactsData, VisitorData } from "../../store/actions/AuthActions";
import moment from "moment";
// import PushNotificationIOS from "@react-native-community/push-notification-ios";
// import PushNotification from "react-native-push-notification";
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

const Contacts = (props) => {
  const api_Key = useSelector((state) => state.AuthReducer.users.api_key);
  const apiKeySocket = useSelector((state) => state.AuthReducer.users.api_key);
  const contactsData = useSelector(
    (state) => state.AuthReducer.contactsSuccessData
  );
  const visitorsData = useSelector(
    (state) => state.AuthReducer.visitorSuccessData
  );

  const isLoading = useSelector((state) => state.AuthReducer.loading);
  console.log("isLoading", isLoading);
  // console.log("contactsData",contactsData)
  // console.log("Visitors Data",visitorsData)

  const socket = io("https://socket.agilepusher.com", {
    reconnection: true,
    reconnectionDelay: 50000,
    reconnectionDelayMax: 50000,
    reconnectionAttempts: 3,
    query: { apiKey: apiKeySocket, type: "gtChatPro" },
    transports: ["websocket"],
  });

  const dispatch = useDispatch();
  const { navigation } = props;

  const [chatList, set_chatList] = useState([]);
  const [visitors, set_visitors] = useState([]);
  const [loading, set_loading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [visitorsApiRes, setVisitorsApiRes] = useState([]);
  const [agentsApiRes, setAgentsApiRes] = useState([]);

  const [activityLoading, setActivityLoading] = useState(true);
  const [activityLoadingVisitor, setActivityLoadingVisitor] = useState(true);

  const client_id = useSelector((state) => state.AuthReducer.users.id);

  const [IOSNotificationData, setIOSNotificationData] = useState({})
  const [IOSNotificationTopic, setIOSNotificationTopic] = useState('')
  const currentRoute = useRoute();

  const currentScreenRoute = useSelector(
    (state) => state.AuthReducer.currentScreen
  );
  // console.log("Current Screen Contacts===>",currentScreenRoute)

  let currentPage =
    // contactsData?.agent_chats?.current_page
    agentsApiRes?.current_page;
  // console.log("check",agentsApiRes?.current_page)
  // contactsData?.agent_chats)
  let currentVisitorsPage = visitorsApiRes?.current_page;

  var gotNewMessageCount = 0;

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // let contactsParams={
      //     api_key:api_Key,
      //     page:1
      // }
      // dispatch(ContactsData(contactsParams))
      // console.log("useeffect focus====>",contactsData)
      // set_chatList(contactsData?.agent_chats?.data)
      // setAgentsApiRes(contactsData?.agent_chats)

      // getAgentChats();

      // getVisitorsChat();

      dispatch({
        type: allActions.CURRENT_SCREEN,
        payload: currentRoute?.name,
      });
      ClearNotification();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    // console.log("contact data useeffect")
    // console.log("contact data useeffect===>",contactsData?.err)

    if (contactsData?.err == "Unauthenticated.") {
      AsyncStorage.removeItem("API_TOKEN");
      dispatch({ type: allActions.LOG_OUT, payload: "" });
    }

    set_chatList(contactsData?.agent_chats?.data);
    setAgentsApiRes(contactsData?.agent_chats);

    // return () => {
    //         cleanup
    //     }
  }, [contactsData]);

  useEffect(() => {
    // console.log("Visitor data useeffect")
    set_visitors(visitorsData?.visitors?.data);
    setVisitorsApiRes(visitorsData?.visitors);
  }, [visitorsData]);

  useEffect(() => {
    let contactsParams = {
      api_key: api_Key,
      page: 1,
    };
    dispatch(ContactsData(contactsParams));
    // console.log("useeffect focus====>",contactsData)
    set_chatList(contactsData?.agent_chats?.data);
    setAgentsApiRes(contactsData?.agent_chats);

    dispatch(VisitorData(contactsParams));

    set_visitors(visitorsData?.visitors?.data);

    setVisitorsApiRes(visitorsData?.visitors);

    // return () => {
    //     cleanup
    // }
  }, []);

  // useEffect(() => {
  //   socket.on("disconnect", () => {
  //     console.log("disconnected");
  //     userLoginAPi(0);
  //   });

  //   socket.on("connect", () => {
  //     console.log("Inside Chat Screen Connected");
  //     transferSocket();
  //     initConnectionParams();
  //     userLoginAPi(1);
  //     getNewMessage();
  //   });

  //   socket.on("reconnect", () => {
  //     console.log("Reconnect is Working.");
  //   });
  // }, []);
//   const requestUserPermission = async () => {
//     /**
//      * On iOS, messaging permission must be requested by
//      * the current application before messages can be
//      * received or sent
//      */
//     const authStatus = await messaging().requestPermission();
//     console.log('Authorization status(authStatus):', authStatus);
//     messaging().subscribeToTopic("GTPRO");
//     return (
//         authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//         authStatus === messaging.AuthorizationStatus.PROVISIONAL  
//     );
// };
//   useEffect(() => {
//     if (requestUserPermission()) {
//         const unsubscribe = props.navigation.addListener('focus', async () => {
//             // messaging().getIsHeadless Start from here for messages or invoking from bg when app is killed
//             PushNotification?.createChannel(
//                 {
//                     channelId: 'com.gtChatPro.app', // (required)
//                     channelName: 'com.gtChatPro.app', // (required)
//                     channelDescription: 'A channel to categorise your notifications', // (optional) default: undefined.
//                     playSound: false, // (optional) default: true
//                     soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
//                     // importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
//                     vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
//                     data: {}
//                 },
//                 (created) => { console.log("Channel Created" + `${created}`) },
//             );
//            console.log("messaging().hasPermission", await  messaging().hasPermission())
//             messaging().onMessage(async remoteMessage => {

//                 // let data = JSON.stringify(remoteMessage)
//                 console.log('A new FCM message arrived!', remoteMessage);
//                 if (Platform.OS == 'ios') {
//                   console.log("inIOS")
//                     // setIOSNotificationTopic(remoteMessage.data.topic)
//                     // if (remoteMessage.data.topic == "chat") {
//                     //     let data = JSON.parse(remoteMessage.data.chat)
//                     //     console.log("parsedNOti", data)
//                     //     setIOSNotificationData(remoteMessage.data)
//                     //     PushNotificationIOS.addNotificationRequest({
//                     //         id: 'notificationWithSound',
//                     //         title: remoteMessage.notification.title,
//                     //         subtitle: '',
//                     //         body: data.text,
//                     //         sound: 'default',
//                     //         badge: 1,
//                     //     })
//                     // }
//                     // else {
//                     //     console.log("Asliasli")
//                     //     PushNotificationIOS.addNotificationRequest({
//                     //         id: 'notificationWithSound',
//                     //         title: remoteMessage.notification.title,
//                     //         subtitle: '',
//                     //         body: remoteMessage.notification.body,
//                     //         sound: 'default',
//                     //         badge: 1,
//                     //     })
//                     // }
//                 }
//             });
//             messaging().onNotificationOpenedApp(data => {
//                 console.log("clicked", data)
                
//             })
//             messaging()?.getInitialNotification().then(remoteMessage => {
//               console.log("getInitialNotification",remoteMessage)
//                 if (remoteMessage) {
//                     console.log(
//                         'quit state====>',
//                         remoteMessage,
//                     )
                    
//                 }
//             });

//             return () => {
//                 unsubscribe;
//             };
//         });
//     }
//     else {
//         console.log("NOPermission Authorized")
//     }
// }, []);
  useEffect(() => {
    const unsubscribe = messaging()?.onMessage(async (remoteMessage) => {
      console.log("remote message==>", remoteMessage);
      // const item = JSON.parse(remoteMessage?.data?.user);

      if (currentScreenRoute != "Chat") {
        if (Platform.OS == "ios") {
            console.log("ForIOS")
        //   setIOSNotificationTopic(remoteMessage.data.topic);
        //   if (remoteMessage.data.topic == "chat") {
        //     let data = JSON.parse(remoteMessage.data.chat);
        //     console.log("parsedNOti", data);
        //     setIOSNotificationData(remoteMessage.data);
        //     PushNotificationIOS.addNotificationRequest({
        //       id: "notificationWithSound",
        //       title: remoteMessage.notification.title,
        //       subtitle: "",
        //       body: data.text,
        //       sound: "default",
        //       badge: 1,
        //     });
        //   } else {
        //     console.log("Asliasli");
        //     PushNotificationIOS.addNotificationRequest({
        //       id: "notificationWithSound",
        //       title: remoteMessage.notification.title,
        //       subtitle: "",
        //       body: remoteMessage.notification.body,
        //       sound: "default",
        //       badge: 1,
        //     });
        //   }
        } else {
          LocalNotification(remoteMessage);
        }
      }
    });
    messaging()?.onNotificationOpenedApp((remoteMessage) => {
      console.log("onNotificationOpenedApp",remoteMessage)
      const item = JSON.parse(remoteMessage?.data?.user);
      ClearNotification();
      navigation.navigate("Contacts");
      setTimeout(() => {
        navigation.navigate(remoteMessage?.data?.type, { item: item });
      }, 100);
    });

    messaging()
      ?.getInitialNotification()
      .then((remoteMessage) => {
        console.log("getInitialNotification",remoteMessage)

        if (remoteMessage) {
          console.log("quit state====>", remoteMessage);
          ClearNotification();

          const item = JSON.parse(remoteMessage?.data?.user);
          //   if(item.accepted_by==null){
          //      navigation.navigate("Archive",{item:item});

          //   }else{
          // console.log("notification user key===>",item)

          // navigation.navigate(remoteMessage?.data?.type,{item:item});

          //   }

          //   navigation.navigate(remoteMessage.data.type);
          //   setInitialRoute(remoteMessage.data.type); // e.g. "Settings"
        }
        // setLoading(false);
      });

    return unsubscribe;
    // }
  }, [currentScreenRoute]);
  useEffect(() => {
    const type = 'localNotification';//notification
    console.log("ListnerIOSNotificationData", IOSNotificationData)
    PushNotificationIOS.addEventListener(type, onRemoteNotification);
    return () => {
        PushNotificationIOS.removeEventListener(type);
    };
}, [IOSNotificationData, IOSNotificationTopic]);//IOSNotificationData, IOSNotificationTopic
const onRemoteNotification = (notification) => {
    const isClicked = notification.getData()["userInteraction"] === 1;
    console.log("123456", isClicked)
    // const actionIdentifier = notification.getActionIdentifier();
    // console.log("actionIdentifier",actionIdentifier)
    // if (actionIdentifier === 'open') {
    //     // Perform action based on open action
    //     console.log("openMaa")
    // }
    if (isClicked) {
        // Navigate user to another screen
        console.log("isCLickedIOS", notification, IOSNotificationData, IOSNotificationTopic)
        // if (IOSNotificationTopic == "chat") {
        //     props.navigation.navigate('Chat', { data: IOSNotificationData, isFrom: 'Home' })
        // }
        // else {
        //     console.log("IOSNOTI", notification._alert)
        //     setshowNotification(true)
        //     setNotificationTitle(notification._alert)
        //     setNotificationSubTitle(notification._title)
        // }
    } else {
        // Do something else with push notification
        console.log("notCLickedIOS", notification)
    }
    // Use the appropriate result based on what you needed to do for this notification
    const result = PushNotificationIOS.FetchResult.NoData;
    console.log("1122", result)
    notification.finish(result);
};
  var tempObj = [];

  const userLoginAPi = async (status) => {
    let params = { user_id: client_id, user_status: status };
    let res = await Api.post("messenger/update-owner-status", params);

    if (res.code == 200) {
      var msg = "user_status_online_owner_" + res.user_status + "_" + client_id;
      socket.emit("agInfoMessage_dev", msg);
    } else {
      if (res.err == "Unauthenticated.") {
        AsyncStorage.removeItem("API_TOKEN");
        dispatch({ type: allActions.LOG_OUT, payload: "" });
      }
    }
  };

  function transferSocket() {
    socket.on("reject", function (agentName, chatID) {
      let contactsParams = {
        api_key: api_Key,
        page: 1,
      };
      dispatch(ContactsData(contactsParams));
      dispatch(VisitorData(contactsParams));

      // getAgentChatsOnNewMsg();
      // getVisitorsChat();
    });

    socket.on("agInfoMessage_dev", function (msg) {
      if (msg?.includes("chat accepted")) {
        var arr = msg.split("_");

        let contactsParams = {
          api_key: api_Key,
          page: 1,
        };
        dispatch(ContactsData(contactsParams));
        dispatch(VisitorData(contactsParams));

        // getAgentChats();
        // getVisitorsChat();
      }

      if (msg && msg.includes("-")) {
        var arr = msg.split("-");

        if (arr[3] == client_id) {
          let newObj = [
            {
              id: arr[1],
              user_id: arr[2],
              recent_message_sent_at: "2022-05-18 12:51:36",
              avatar: "https://i.pravatar.cc/300",
              accepted_by: arr[1],
            },
          ];

          tempObj = [...tempObj, ...newObj];

          dispatch({ type: allActions.TRANSFERED_REQ, payload: tempObj });
        } else {
          // console.log('id did not match')
        }
      }
    });
  }

  const getVisitorsChat = async () => {
    // set_loading(true);
    let res = await Api.get("admin/profile/visitor-chats");
    if (res.success) {
      let visitors = res?.visitors?.data;
      set_visitors(visitors);

      setVisitorsApiRes(res.visitors);
    } else {
      // set_loading(false);
    }
  };

  function initConnectionParams() {
    // console.log('Contact screen into init params func')

    // console.log('initconnectparams', 'roomId', roomID, 'receiver', receiverID, 'userId', userId);
    let user_id = client_id;

    socket.on("agAskedToJoin", function (room, receiver) {
      let myObj = visitors?.find((obj) => obj.id === room);
      if (myObj == "undefined" || (myObj == null && receiver == client_id)) {
        //  console.log('got a new visitor')
        //  getVisitorsChat();
        let contactsParams = {
          api_key: api_Key,
          page: 1,
        };
        dispatch(VisitorData(contactsParams));
      } else {
        //  console.log('Not a new Visitor')
      }

      if (room) {
        // console.log("room ma hm hain", room)
        //   LocalNotifications()
      }
      if (user_id == receiver) {
        // console.log('agAskedToJoin from contact screen==>', room, 'receiver', receiver);

        // console.log('inside emit room joined from contact screen', room, ' user id=> ', user_id);
        socket.emit("agRoomJoined", room, user_id, "");
      }
    });
  }

  function getNewMessage() {
    // console.log("contact screen new message")

    socket.on("agGotNewMessage", function (msg, sender, chatId, type) {
      // console.log('agGotNewMessage from contact', msg, 'chat_id ', chatId, 'sender', sender," Type==>",type)

      // gotNewMessageCount=0;

      // console.log('Check flag is===>',notificationFlag)
      // if(gotNewMessageCount==0){
      if (isLoading == false) {
        // gotNewMessageCount=1
        // getAgentChatsOnNewMsg()
        // console.log('Check flag is===>')

        let contactsParams = {
          api_key: api_Key,
          page: 1,
        };
        dispatch(ContactsData(contactsParams));
      }
    });
  }

  let count = 0;

  const getAgentChats = async () => {
    // console.log('agents chat runned')
    // console.log("agents chat api called")

    set_loading(true);
    let res = await Api.get(`admin/profile/agent-chats?api_key=${api_Key}`);
    if (res.success) {
      // console.log('agent chat api res===>',res)
      let agentChat = res?.agent_chats?.data;
      set_chatList(agentChat);
      setAgentsApiRes(res.agent_chats);
      gotNewMessageCount = 0;
      set_loading(false);
    } else {
      set_loading(false);

      if (res.err == "Unauthenticated.") {
        AsyncStorage.removeItem("API_TOKEN");
        dispatch({ type: allActions.LOG_OUT, payload: "" });
        // Helpers.showToast("You've Been Logged out")
      }
    }
  };

  const getAgentChatsOnNewMsg = async () => {
    // console.log('agents chat runned')
    // console.log("agents chat api called")

    // set_loading(true);
    let res = await Api.get(`admin/profile/agent-chats?api_key=${api_Key}`);
    if (res.success) {
      // console.log('agent chat api res===>',res)
      let agentChat = res?.agent_chats?.data;
      set_chatList(agentChat);
      setAgentsApiRes(res.agent_chats);
      gotNewMessageCount = 0;
      // set_loading(false);
    } else {
      // set_loading(false);

      if (res.err == "Unauthenticated.") {
        AsyncStorage.removeItem("API_TOKEN");
        dispatch({ type: allActions.LOG_OUT, payload: "" });
        // Helpers.showToast("You've Been Logged out")
      }
    }
  };

  const getAgentChatsPagination = async (page) => {
    set_loading(true);
    console.log("agents chat pagination api called");
    let res = await Api.get(
      `admin/profile/agent-chats?api_key=${api_Key}&page=${page}`
    );
    if (res.success) {
      set_loading(false);

      console.log("agent chat api res===>", res);
      let agentChat = res?.agent_chats?.data;
      set_chatList([...chatList, ...agentChat]);

      setAgentsApiRes(res.agent_chats);
    } else {
      set_loading(false);
    }
  };

  const getVisitorsChatPagination = async (page) => {
    // set_loading(true);
    let res = await Api.get(
      `admin/profile/visitor-chats?api_key=${api_Key}&page=${page}`
    );
    if (res.success) {
      let visitorsData = res?.visitors?.data;
      set_visitors([...visitors, ...visitorsData]);
      setVisitorsApiRes(res.visitors);
      // set_loading(false);
    } else {
      // set_loading(false);
    }
  };

  const renderVisitorsChats = ({ item }) => {
    return (
      <TouchableOpacity
        style={{ alignItems: "center", padding: wp(2) }}
        onPress={() =>
          navigation.navigate("Chat", { item: item, fromArcieve: false })
        }
      >
        <Avatar
          avatarStyle={{
            borderColor: Helpers.Colors.primary,
            borderWidth: wp("0.05"),
          }}
          source={{ uri: item.avatar }}
          rounded
          size={"medium"}
        />
        {/* <FastImage
                    // size={55}
                    // rounded
                    style={{ height: hp(6), width: hp(6),borderRadius:wp(6) }}
                    source={{ uri: item.avatar }} 
                    resizeMode='cover' /> */}
        {item.user_status == 1 && (
          <Badge
            status="success"
            containerStyle={{
              position: "absolute",
              top: wp("11"),
              right: wp("3"),
            }}
          />

          // containerStyle={{ position: 'absolute', top: hp(6), right: wp(4.5), }} />
        )}
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          style={{
            width: wp(15),
            height: hp(10),
            fontSize: 12,
            marginTop: hp(1),
            color: Helpers.Colors.lightTxt,
            fontWeight: "500",
            textAlign: "center",
          }}
        >
          {item.user_id}
        </Text>
      </TouchableOpacity>
    );
  };
  const renderFlatlistFooter = () => {
    //
    // if(agentsApiRes.data&&agentsApiRes.data.length==0){
    if (
      contactsData?.agent_chats?.data &&
      contactsData?.agent_chats?.data?.length == 0
    ) {
      return null;
    }

    if (activityLoading) {
      return (
        <SkeletonPlaceholder>
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                height: hp(7),
                width: hp(7),
                borderRadius: (hp(7) * hp(7)) / 2,
              }}
            ></View>
            <View
              style={{
                height: hp(6.5),
                width: wp(80),
                backgroundColor: "red",
                marginLeft: 3,
              }}
            ></View>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                height: hp(7),
                width: hp(7),
                borderRadius: (hp(7) * hp(7)) / 2,
              }}
            ></View>
            <View
              style={{
                height: hp(6.5),
                width: wp(80),
                backgroundColor: "red",
                marginLeft: 3,
              }}
            ></View>
          </View>
        </SkeletonPlaceholder>
      );
    } else {
      return null;
    }
  };

  const visitorFlatlistFooter = () => {
    // activityLoadingVisitor
    if (isLoading) {
      return (
        <SkeletonPlaceholder>
          <View style={{ flexDirection: "row", marginTop: hp(1.8) }}>
            <View
              style={{
                height: hp(6),
                width: hp(6),
                borderRadius: (hp(7) * hp(7)) / 2,
                marginLeft: wp(2),
              }}
            ></View>

            <View
              style={{
                height: hp(6),
                width: hp(6),
                borderRadius: (hp(7) * hp(7)) / 2,
                marginLeft: wp(2),
              }}
            ></View>

            <View
              style={{
                height: hp(6),
                width: hp(6),
                borderRadius: (hp(7) * hp(7)) / 2,
                marginLeft: wp(2),
              }}
            ></View>
          </View>
        </SkeletonPlaceholder>
      );
    } else {
      return null;
    }
  };

  const renderMembers = ({ item }) => {
    let time = moment(item.recent_message_sent_at).format("hh:mm A");

    // var str = item.recent_message_sent_at;
    // console.log("time====>",time)

    // var timeHour=str?parseInt(str.substring(11,13)):"";
    // var ampm;
    // if(timeHour==""){

    // }else if(timeHour<12){

    //     ampm="am"
    // }
    // else{

    //     ampm="pm"
    // }

    // if(timeHour>12){
    //     timeHour=timeHour-12
    // }

    // var timeMin=str?str.substring(13,16):""

    // // let count = 0
    // // var msgLength = item.messages.length - 1

    var subText;
    if (
      item?.latest_message?.type == "text" ||
      item?.latest_message?.type == "word"
    ) {
      subText =
        item?.latest_message?.message.length > 29
          ? `${item?.latest_message?.message.slice(0, 29)}......`
          : item?.latest_message?.message;
    } else if (item?.latest_message?.type == "voice") {
      subText = "Voice Message";
    } else if (item?.latest_message?.type == "file") {
      subText = "File";
    } else if (item?.latest_message?.type == "map") {
      subText = "Location";
    }

    // item?.messages.forEach(element => {
    //     if (item?.user_id == element?.sender)
    //         if (element?.seen_status == 0) {
    //             count++;
    //         }
    // });

    return (
      // <View>

      //     {/* <TouchableOpacity style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', padding: wp(2), flexDirection: 'row',backgroundColor:Helpers.Colors.itemSeparator }}
      //          onPress={() => {navigation.navigate('Chat', {item:item,fromArchieve:false})}}
      //         // onPress={() => { toggleModal(item) }}

      //     > */}

      <TouchableOpacity
        style={{
          flex: 1,
          justifyContent: "space-between",
          alignItems: "center",
          padding: wp("2"),
          margin: wp("1"),
          shadowOpacity: wp("0.26"),
          shadowOffset: { height: 1, width: 1 },
          shadowColor: "rgba(0, 0, 0, 0.04)",
          elevation: wp("5"),
          flexDirection: "row",
          backgroundColor: "#fff",
          borderRadius: wp("1"),
        }}
        onPress={() => {
          navigation.navigate("Chat", {
            item: item,
            fromArchieve: false,
            isClosed: item.closed,
          });
        }}
      >
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <View>
            <FastImage
              // size={55}
              // rounded
              style={{
                height: hp(6.5),
                width: hp(6.5),
                borderRadius: hp(6.5) / 2,
                borderColor: Helpers.Colors.primary,
                borderWidth: wp("0.05"),
              }}
              source={{ uri: item.avatar }}
              resizeMode={"cover"}
            />
            {item.user_status == 1 && (
              <Badge
                status="success"
                containerStyle={{
                  position: "absolute",
                  top: hp(5),
                  right: wp(1),
                }}
              />
            )}
          </View>
          <View style={{ marginStart: wp(3) }}>
            <Text
              style={{
                color: Helpers.Colors.dark,
                fontSize: 14,
                marginTop: hp(1),
                fontWeight: "700",
              }}
            >
              {item?.visitor?.name ? item?.visitor?.name : item.user_id}
            </Text>
            <Text
              style={{
                color: Helpers.Colors.lightTxt,
                fontSize: 12,
                marginTop: hp(1),
              }}
            >
              {subText}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: Helpers.Colors.lightTxt, fontSize: 12 }}>
              {time}
            </Text>
          </View>
          {item?.unread_messages_count > 0 && (
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 20 / 2,
                backgroundColor: Helpers.Colors.primary,
                justifyContent: "center",
                alignItems: "center",
                marginTop: hp(1),
              }}
            >
              <Text style={{ fontSize: 12, color: Helpers.Colors.light }}>
                {item?.unread_messages_count}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      // </View>
    );
  };

  const flatlistEmptyComponent = () => {
    return (
      <View
        style={{
          flex: 1,
          height: hp(50),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: Helpers.Colors.lightTxt, fontSize: hp(2) }}>
          {contactsData?.agent_chats?.data?.length == 0 && "No Chats Avaiable"}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerVw}>
        <View>
          <Image
            source={Helpers.Images.appLogo}
            resizeMode="contain"
            style={styles.gtLogo}
          />
        </View>
      </View>

      <View style={[styles.onlineMembers, { backgroundColor: "#ffffff" }]}>
        <View style={{ padding: wp(2) }}>
          <Text style={{ color: Helpers.Colors.dark, fontWeight: "700" }}>
            Visitors
          </Text>
        </View>

        <FlatList
          data={visitors}
          renderItem={renderVisitorsChats}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          ListFooterComponent={visitorFlatlistFooter}
          onEndReached={() => {
            // flatlistEnd();
            if (currentVisitorsPage < visitorsData?.visitors?.last_page) {
              currentVisitorsPage = currentVisitorsPage + 1;
              getVisitorsChatPagination(currentVisitorsPage);
            }
            if (visitorsData?.visitors?.next_page_url == null) {
              setActivityLoadingVisitor(false);
            }
          }}
        />
      </View>

      {/*  agents chat list here */}

      <View style={{ flex: 1, width: wp("100") }}>
        <View style={{ padding: wp(2), margin: wp("2") }}>
          <Text style={{ color: Helpers.Colors.dark, fontWeight: "700" }}>
            Chats
          </Text>
        </View>
        <FlatList
          data={chatList}
          // data={contactsData?.agent_chats?.data}
          renderItem={renderMembers}
          style={{
            width: "100%",
            padding: wp(1),
            marginBottom: wp("0"),
            backgroundColor: Helpers.Colors.itemSeparator,
          }}
          ItemSeparatorComponent={() => (
            <View
              style={{
                backgroundColor: Helpers.Colors.itemSeparator,
                height: 1,
                width: wp(100),
              }}
            />
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={flatlistEmptyComponent}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                // getVisitorsChat();
                // getAgentChats()
                let contactsParams = {
                  api_key: api_Key,
                  page: 1,
                };
                dispatch(ContactsData(contactsParams));
                dispatch(VisitorData(contactsParams));
              }}
            />
          }
          onEndReached={() => {
            // flatlistEnd();
            console.log("woa", currentPage);

            if (currentPage < contactsData?.agent_chats?.last_page) {
              currentPage = currentPage + 1;

              getAgentChatsPagination(currentPage);
            } else {
              console.log("pagesover");
            }
            if (contactsData?.agent_chats?.next_page_url == null) {
              setActivityLoading(false);
            }
          }}
        />
      </View>

      {loading && (
        <Helpers.Indicator
          color={Helpers.Colors.primary}
          style={{
            height: hp(100),
            width: wp(100),
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            position: "absolute",
            zIndex: 1,
          }}
        />
      )}
    </View>
  );
};
export default Contacts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Helpers.Colors.light,
  },
  headerVw: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: wp(3),
    height: hp(12),
  },
  gtLogo: { width: wp(30) },
  headerSub: { flexDirection: "row" },
  headerItems: { width: wp(7), marginStart: wp(2) },
  onlineMembers: {
    backgroundColor: Helpers.Colors.inputFieldBg,
    height: hp("18"),
    width: wp("100"),
  },
  chatVw: {
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    padding: wp(2),
    flexDirection: "row",
  },
});
