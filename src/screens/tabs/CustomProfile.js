import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ActivityIndicator,
  Switch,
  ScrollView,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useSelector } from "react-redux";
import * as Helpers from "../../assets/Exporter";
import { ImageBackground } from "react-native";
import { TouchableOpacity } from "react-native";
import { useState } from "react";
import { useEffect } from "react";
import Api from "../../network/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { allActions } from "../../store/actions/allActions";
import messaging from "@react-native-firebase/messaging";
import { io } from "socket.io-client";

const CustomProfile = (props) => {
  const apiKeySocket = useSelector((state) => state.AuthReducer.users.api_key);

  const socket = io("https://socket.agilepusher.com", {
    reconnection: true,
    reconnectionDelay: 50000,
    reconnectionDelayMax: 50000,
    reconnectionAttempts: 3,
    query: { apiKey: apiKeySocket, type: "gtChatPro" },
    transports: ["websocket"],
  });

  const [profilePic, setProfilePic] = useState("");
  const user = useSelector((state) => state.AuthReducer.users);
  const client_id = useSelector((state) => state.AuthReducer.users.id);
  console.log("user==>", user);
  const userProfilePic = user?.image;
  const [isDisabled, setIsDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [isEnabled, setIsEnabled] = useState(false);
  const [fcmToken, setFcmToken] = useState("");
  const toggleSwitch = () => {
    setIsEnabled((previousState) => !previousState), upDateNotification();
  };

  useEffect(async () => {
    socket.on("connect", () => {
      console.log("Inside Profile Screen Connected", isEnabled);
    });

    socket.on("disconnect", () => {
      console.log("disconnected from");
      // userLoginAPi(0);
    });

    setProfilePic(userProfilePic);
    let checkNoti = await AsyncStorage.getItem("visitorNotiVal");
    console.log("checkNoti", checkNoti);
    checkNoti == "true" ? setIsEnabled(true) : setIsEnabled(false);
  }, []);

  const userLoginAPi = async (status) => {
    let params = { user_id: client_id, user_status: 0 };
    let res = await Api.post("messenger/update-owner-status", params);
    // console.log(res)
    if (res.success) {
      // console.log('Update owner status res===>',res)
      var msg = "user_status_online_owner_0_" + client_id;
      socket.emit("agInfoMessage_dev", msg);
    } else {
      if (res.err == "Unauthenticated.") {
        AsyncStorage.removeItem("API_TOKEN");
        dispatch({ type: allActions.LOG_OUT, payload: "" });
      }
    }
  };

  const logoutFunc = async () => {
    userLoginAPi();
    setIsDisabled(true);
    setLoading(true);
    let res = await Api.post("logout_api", "");
    // console.log('logout api response is===>',res)
    var msg = "user_status_online_owner_0_" + client_id;
    socket.emit("agInfoMessage_dev", msg);
    let res1 = JSON.stringify(res);

    // AsyncStorage.removeItem('API_TOKEN')
    // dispatch({ type: allActions.LOG_OUT,payload: ''})

    if (res1.includes("Successfully logged out")) {
      // var msg = 'user_status_online_owner_' + 0 + "_" + client_id;
      // socket.emit('agInfoMessage_dev', msg);
      setLoading(false);
      Helpers.showToast("You've Succesfully logged out");
      AsyncStorage.removeItem("API_TOKEN");
      dispatch({ type: allActions.LOG_OUT, payload: "" });
      messaging().unsubscribeFromTopic("Global");
      messaging().unsubscribeFromTopic("Chat");
      setIsDisabled(false);
    } else {
      setLoading(false);
      if (res.err == "Unauthenticated.") {
        AsyncStorage.removeItem("API_TOKEN");
        dispatch({ type: allActions.LOG_OUT, payload: "" });
        setIsDisabled(false);

        // Helpers.showToast("You've Been Logged out")
      }
    }
    const timer = setTimeout(() => {
      setIsDisabled(false);
    }, 10000);
    // props.navigation.navigate('Login')
    //  return (<Router />)
  };
  const upDateNotification = async () => {
    let params = { user_id: client_id, key: "new_visitor" };
    let res = await Api.post("user/fcm-notification-update", params);
    console.log("NOticationStatus", res);
    if (res.success) {
      res?.status == 1 ? setIsEnabled(true) : setIsEnabled(false);
      Helpers.showToast(res?.message);
      let localNoti = res.status == 1 ? "true" : "false";
      AsyncStorage.setItem("visitorNotiVal", localNoti);
    } else {
      Helpers.showToast(res?.message);
    }
  };

  return (
    <ImageBackground
      style={styles.container}
      source={Helpers?.Images?.profileBackgroundImage}
    >
      <View
        style={{ height: hp(60), width: wp(100), backgroundColor: "white" }}
      >
        <View style={styles.imageView}>
          <Image
            source={
              profilePic
                ? { uri: profilePic }
                : Helpers.Images.profilePicPlaceholder
            }
            resizeMode="contain"
            style={styles.profilePic}
          />
        </View>
        <Text style={styles.nameTextStyle}>{user?.name}</Text>

        <View style={styles.personalInfoView}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: "black" }}>
            {user.personal_info}
          </Text>
          {/* .............Details */}
          <View style={{ flexDirection: "row", marginTop: hp(2) }}>
            {/* <Icon name="email" type="fontisto" size={25} color={'red'} /> */}
            <Image
              source={Helpers.Images.gmailIcon}
              resizeMode="contain"
              style={{ width: hp(3), height: hp(4) }}
            />

            <View style={styles.personalDetailsView}>
              <Text style={styles.detailsLabel}>{user?.email}</Text>
              <Text style={styles.detailsText}>{user?.email}</Text>
            </View>
          </View>
          {/* //////// */}

          <View style={{ flexDirection: "row", marginTop: hp(2) }}>
            {/* <Icon name="email" type="fontisto" size={25} color={'red'} /> */}
            <Image
              source={Helpers.Images.designationIcon}
              resizeMode="contain"
              style={{ width: hp(3), height: hp(4) }}
            />

            <View style={styles.personalDetailsView}>
              <Text style={styles.detailsLabel}>{user?.designation_txt}</Text>
              <Text style={styles.detailsText}>{user?.designation}</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", marginTop: hp(2) }}>
            {/* <Icon name="whatsapp" type="material-community" size={25} color={'green'} /> */}
            <Image
              source={Helpers.Images.departmentIcon}
              resizeMode="contain"
              style={{ width: hp(3), height: hp(4) }}
            />

            <View style={styles.personalDetailsView}>
              <Text style={styles.detailsLabel}>{user?.department_txt}</Text>
              <Text style={styles.detailsText}>{user?.department?.name}</Text>
            </View>
          </View>
          {/* Notification On off Start  */}
          <View style={{ flexDirection: "row", marginTop: hp(2) }}>
            {/* <Icon name="whatsapp" type="material-community" size={25} color={'green'} /> */}
            <Image
              source={Helpers.Images.notificaionIcon}
              resizeMode="contain"
              style={{ width: hp(3), height: hp(4) }}
            />

            <View style={styles.personalDetailsView}>
              <Text style={styles.detailsLabel}>{user?.push_notification}</Text>
              <Switch
                style={styles.detailsText}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
            </View>
          </View>
          {/* Notificationi On Off end */}
          {/* /////// */}

          {/* <View style={{ flexDirection: 'row', marginTop: hp(2) }}>

                        <Image source={Helpers.Images.whatsappIcon} resizeMode="contain" style={{ width: hp(3), height: hp(4) }} />

                        <View style={styles.personalDetailsView}>
                            <Text style={styles.detailsLabel}>Whatsapp</Text>
                            <Text style={styles.detailsText}>{user?.whatsapp_id}</Text>
                        </View>

                    </View> */}

          {/* /////// */}

          <View style={{ flexDirection: "row", marginTop: hp(2) }}>
            {/* <Icon name="whatsapp" type="material-community" size={25} color={'green'} /> */}
            <Image
              source={Helpers.Images.expiredIcon}
              resizeMode="contain"
              style={{ width: hp(3), height: hp(4) }}
            />

            <View style={styles.personalDetailsView}>
              <Text style={styles.detailsLabel}>Package Exipre</Text>
              <Text style={styles.detailsText}>{user?.package_expired}</Text>
            </View>
          </View>

          {/* ///////// */}

          <TouchableOpacity
            style={
              isDisabled ? styles.logoutButtonDisabled : styles.logoutButton
            }
            disabled={isDisabled}
            onPress={logoutFunc}
          >
            {loading ? (
              <ActivityIndicator size={"small"} color="white" />
            ) : (
              <Text style={{ color: "white", fontSize: 15, fontWeight: "700" }}>
                Logout
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      {/* {isEnabled ? upDateNotification():upDateNotification()} */}
    </ImageBackground>
  );
};
export default CustomProfile;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-end", alignItems: "center" },
  imageView: {
    height: hp(15),
    width: hp(15),
    backgroundColor: "white",
    borderRadius: 10,
    // zIndex:1,
    marginTop: hp(-7),
    marginLeft: wp(5),
    alignItems: "center",
    justifyContent: "center",
  },
  profilePic: {
    height: hp(13),
    width: hp(13),
    borderRadius: 10,
  },
  nameTextStyle: {
    marginLeft: wp(40),
    marginTop: hp(-6),
    fontSize: hp(2),
    fontWeight: "600",
    color: "black",
  },
  personalInfoView: {
    // flex:1,
    marginTop: hp(5),
    marginLeft: wp(9),
  },
  personalDetailsView: {
    marginLeft: wp(3),
  },
  detailsLabel: {
    fontSize: hp(1.9),
    fontWeight: "600",
    color: "black",
    // marginBottom:hp(1)
  },
  detailsText: {
    fontSize: hp(1.5),
    marginTop: hp(1),
    color: "#333",
    alignSelf: "flex-start",
  },
  logoutButton: {
    marginTop: hp(2),
    height: hp(3.5),
    width: hp(10),
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: hp(1),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  logoutButtonDisabled: {
    marginTop: hp(5),
    height: hp(3.5),
    width: hp(10),
    backgroundColor: "grey",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: hp(1),

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
});
