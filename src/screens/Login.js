import React, { useState, useEffect, useMemo } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import { Formik } from "formik";
import * as Yup from "yup";

import { all, select } from "redux-saga/effects";
import { CheckBox } from "react-native-elements";
import messaging from "@react-native-firebase/messaging";

import * as Helpers from "../assets/Exporter";

import { useDispatch } from "react-redux";

import {
  ContactsData,
  getUsers,
  ArchiveData,
  VisitorData,
} from "../store/actions/AuthActions";
import io from "socket.io-client";

import { useSelector } from "react-redux";
import Api from "../network/Api";
import { allActions } from "../store/actions/allActions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { ActivityIndicator } from "react-native";
import { Platform } from "react-native";
import { KeyboardAvoidingView } from "react-native";

const Login = (props) => {
  const dispatch = useDispatch();

  const [users, loader] = useSelector((state) => [
    state.AuthReducer.users,
    state.AuthReducer.loading,
  ]);
  const missToken = useSelector((state) => state.AuthReducer.token);

  const [loading, set_loading] = useState(false);

  const [allUsers, set_allUsers] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  const [fcmToken, setFcmToken] = useState("");

  const [getToken, setToken] = useState(false);
  const [allowedNOtification, setAllowedNotification] = useState(false);
  const LoginSchema = Yup.object().shape({
    email: Yup.string().trim().email().required().label("Email"),
    password: Yup.string().min(8).required().label("Password"),
  });

  useEffect(() => {
    // if (connected) {
    //     addHandlers()
    // }
    if (Platform.OS == "android") {
      console.log("android");
      checkToken();
    } else {
      console.log("ios");

      checkNotificationPermissions();
    }
  }, []);

  const checkNotificationPermissions = async () => {
    const enabled = await messaging().hasPermission();

    console.log("token permission===>", enabled);

    if (enabled != -1) {
      await messaging().registerDeviceForRemoteMessages();
      const device = await messaging().getToken();
      console.log("token===>", device);
      messaging().subscribeToTopic("GTPRO");
      setAllowedNotification(true);
    } else {
      console.log("elsecase");
      setAllowedNotification(false);
      // getNotificationPermissions()
    }
  };

  const getNotificationPermissions = async () => {
    console.log("into get notification permission");
    const authorizationStatus = await messaging().requestPermission();
    const permission = await messaging()
      .requestPermission()
      .then(() => {
        checkNotificationPermissions();
      })
      .catch((error) => {
        // User has rejected permissions
        console.log("error get notification permission=>", error);
      });
  };

  const checkToken = async () => {
    console.log("below topic subscribe");
    const fcmToken = await messaging().getToken();
    messaging().subscribeToTopic("GTPRO");
    if (fcmToken) {
      console.log("fcm token=====>", fcmToken);
      setFcmToken(fcmToken);
    } else {
      console.log("fcm error");
    }
  };

  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };
  // useEffect(() => {

  //     { !allUsers && dispatch({ type: allActions.GET_USERS_SUCCESS, payload: {} }) }

  //     { users ? set_allUsers(true) : set_allUsers(false) }

  //     { loader ? set_loading(true) : set_loading(false) }
  //     {missToken ? dispatch({ type: allActions.AUTH_KEY, payload: missToken }) : null}

  // }, [loader,missToken])

  const rememberMeObj = {
    RememberMe: rememberMe,
  };

  const handleSubmit = async (user) => {
    let fcmDeviceToken = "";
    if (Platform.OS == "ios") {
      if (allowedNOtification) {
        fcmDeviceToken = await messaging().getToken();
        console.log("fcm tokenn===>", fcmDeviceToken);
      }
    } else {
      fcmDeviceToken = await messaging().getToken();
      console.log("fcm tokenn===>", fcmDeviceToken);
    }
    set_loading(true);
    let isMounted = true;
    console.log("fcm tokenn===>", fcmToken);
    let params = {
      email: user.email,
      password: user.password,
      FirebaseId: allowedNOtification
        ? fcmDeviceToken
        : fcmDeviceToken
        ? fcmDeviceToken
        : fcmToken
        ? fcmToken
        : "",
    };
    // Helpers.showToast(
    //   fcmDeviceToken ? fcmDeviceToken : fcmToken ? fcmToken : ""
    // );
    console.log("Login Token===>", params);
    console.log("checktokenn===>", fcmToken);

    let res = await Api.post("login_api", params);
    console.log("checkAPIKEY", res);
    if (res.success == true && isMounted) {
      console.log("res.success == true", res);
      let data = res.data;
      let apiToken = data.api_token;
      let extratext = res.strings
      AsyncStorage.setItem("API_TOKEN", apiToken);
      messaging().subscribeToTopic("Global");
      messaging().subscribeToTopic("Chat");
      let dataMerged = Object.assign(data, rememberMeObj,extratext);
      // let contactsParams = {
      //     api_key: res.data.api_key,
      //     page: 1
      // }

      // dispatch(ContactsData(contactsParams))
      // dispatch(ArchiveData(contactsParams))  
      // dispatch(VisitorData(contactsParams))
      dispatch({ type: allActions.GET_USERS_SUCCESS, payload: dataMerged });
      set_loading(false);
      Helpers.showToast("Login Success");
    } else if (res.success == false) {
      console.log("res.success == false", res);
      set_loading(false);
      Helpers.showToast(res.error);
    } else {
      console.log("else one", res);
      set_loading(false);
      Helpers.showToast(res.error);
    }

    return () => {
      isMounted = false;
    };

    // dispatch({ type: allActions.GET_USERS_SUCCESS, payload: {} });

    // dispatch(getUsers(user));

    // set_allUsers(true)

    // if (users.success) {
    //     set_loading(false)
    //     console.log("goog shit","still shit")

    // } else {
    //     //   let errorTxt = res.error
    //     // Helpers.showToast("oeaslam")
    //       set_loading(false)
    //       console.log("shit","12345678")

    // }
  };

  // function getData() {

  //     console.log("getData", users)

  //     if (users.success) {

  //         let apiTOKEN = users.data.api_token
  //         // console.log("Nice",apiTOKEN)
  //         //  AsyncStorage.setItem("API_TOKEN", apiTOKEN)
  //         //  dispatch({type:allActions.AUTH_KEY,payload:apiTOKEN})
  //         // setToken(true)
  //         Helpers.showToast(apiTOKEN)

  //     }
  //     else if (users.success == false) {
  //         let errorTxt = users.error
  //         Helpers.showToast(errorTxt)

  //     }
  // }

  return (
    // <View style={styles.container}>
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View>
        <Image
          source={Helpers.Images.logInLogo}
          resizeMode="contain"
          style={styles.registerLogo}
        />
      </View>

      <View style={{ marginTop: hp(2) }}>
        <Formik
          validationSchema={LoginSchema}
          initialValues={{ email: "", password: "" }}
          onSubmit={handleSubmit}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            touched,
            errors,
            isValid,
            setFieldTouched,
          }) => (
            <>
              <View>
                <TextInput
                  style={styles.inputTxt}
                  placeholder=" Email address"
                  placeholderTextColor={Helpers.Colors.lightTxt}
                  value={values.email.trim()}
                  autoCapitalize={"none"}
                  onChangeText={handleChange("email")}
                  autoCorrect={false}
                  // maxLength={20}
                  onBlur={() => setFieldTouched("email")}
                />
                {touched.email && errors.email && (
                  <Text style={styles.formikTxtError}>{errors.email}</Text>
                )}
              </View>
              <View>
                <TextInput
                  style={styles.inputTxt}
                  placeholder="Password"
                  placeholderTextColor={Helpers.Colors.lightTxt}
                  value={values.password}
                  autoCapitalize={"none"}
                  onChangeText={handleChange("password")}
                  secureTextEntry={true}
                  autoCorrect={false}
                  maxLength={20}
                  onBlur={() => setFieldTouched("password")}
                />

                {touched.password && errors.password && (
                  <Text style={styles.formikTxtError}>{errors.password}</Text>
                )}
              </View>

              <TouchableOpacity
                style={{
                  width: wp("80"),
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  marginTop: hp(1),
                }}
              >
                {/* <Text style={{ fontSize: 12, color: Helpers.Colors.lightTxt }}>Forgot Password ?</Text> */}
              </TouchableOpacity>
              <View style={{ marginLeft: hp(-2) }}>
                <CheckBox
                  title="Remember Me"
                  checked={rememberMe}
                  onPress={toggleRememberMe}
                  containerStyle={{
                    backgroundColor: "transparent",
                    borderColor: "transparent",
                  }}
                />
              </View>

              <TouchableOpacity
                style={[styles.registerBtn, { alignSelf: "center" }]}
                onPress={handleSubmit}
              >
                {/* disabled={loading} */}

                {loading ? (
                  <ActivityIndicator size="large" color="white" />
                ) : (
                  <Text style={styles.buttonTxt}>Login</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </View>
      {/* <View style={{ justifyContent: "center", alignItems: "center", flexDirection: "row", marginTop: hp(2) }}>
                        <View style={styles.lineSpt} />
                        <Text style={{ marginLeft: wp(1), fontSize: 12, marginRight: wp(1), color: Helpers.Colors.lightTxt }}>Or SignIn with</Text>
                        <View style={styles.lineSpt} />
                  </View>

                  <TouchableOpacity style={styles.socialBtn}>
                        <Image source={Helpers.Images.googleLogo} resizeMode="contain" style={styles.socialLogo} />
                        <Text style={styles.socialBtnTxt}>Register with Google</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.socialBtn}>
                        <Image source={Helpers.Images.fbLogo} resizeMode="contain" style={styles.socialLogo} />
                        <Text style={styles.socialBtnTxt}>Register with Facebook</Text>
                  </TouchableOpacity> */}

      {/* { allUsers ? getData() : null}
            {getToken ? dispatchToken() : null} */}
    </KeyboardAvoidingView>
    // </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Helpers.Colors.light,
  },
  inputTxt: {
    width: wp("90"),
    height: hp(6),
    backgroundColor: Helpers.Colors.inputFieldBg,
    marginTop: hp(1),
    marginBottom: hp(1),
    borderRadius: hp(1),
    padding: wp(2),
    color: "black",
  },
  registerLogo: { width: wp("80"), height: hp("35") },
  registerBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: wp("50"),
    height: hp(6),
    borderRadius: hp("1"),
    backgroundColor: Helpers.Colors.primary,
    marginTop: hp(2),
  },
  buttonTxt: { color: Helpers.Colors.light },
  lineSpt: {
    width: wp(32),
    height: hp(0.04),
    backgroundColor: Helpers.Colors.lightTxt,
  },
  socialBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: wp("90"),
    flexDirection: "row",
    height: hp(6),
    borderRadius: hp("1"),
    borderColor: Helpers.Colors.lightTxt,
    borderWidth: hp(0.04),
    marginTop: hp(2),
  },
  socialBtnTxt: { color: Helpers.Colors.dark },
  socialLogo: { width: wp(6), height: hp(8), marginRight: wp(2) },
  formikTxtError: { fontSize: 12, color: Helpers.Colors.red },
});
