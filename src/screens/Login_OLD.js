import React, { useState, useEffect, useMemo } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import { Formik, } from 'formik';
import * as Yup from 'yup';

import { all, select } from 'redux-saga/effects';



import * as Helpers from '../assets/Exporter';


import { useDispatch } from 'react-redux';

import { getUsers } from '../store/actions/AuthActions';

import { useSelector } from 'react-redux';
import Api from '../network/Api';
import { allActions } from '../store/actions/allActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';


const Login = (props) => {

    const dispatch = useDispatch();

    const [users, loader] = useSelector(state => [state.AuthReducer.users, state.AuthReducer.loading])
    // const missToken = useSelector(state => state.AuthReducer)
    console.log("Token====>",users&&users.data.api_token);
    // const missToken1=missToken?.users?.data?.api_token

    const [loading, set_loading] = useState(false);

    const [allUsers, set_allUsers] = useState(false);

    const [getToken, setToken] = useState(false)

    const LoginSchema = Yup.object().shape({

        email: Yup.string().email().required().label('Email'),
        password: Yup.string().min(4).required().label('Password')

    });

    // useEffect(() => {

    //     { !allUsers && dispatch({ type: allActions.GET_USERS_SUCCESS, payload: {} }) }

    //     { users ? set_allUsers(true) : set_allUsers(false) }

    //     { loader ? set_loading(true) : set_loading(false) }
    //     {missToken ? dispatch({ type: allActions.AUTH_KEY, payload: missToken }) : null}

    // }, [loader,missToken])

    const handleSubmit = async (user) => {

        set_loading(true)
        let isMounted = true;
        let params = { email: user.email, password: user.password }
        dispatch(getUsers(params))
        // let res = await Api.post('login_api', params);

        // if (res.success && isMounted) {
        //     let data = res.data
        //     let apiToken = data.api_token
        //     AsyncStorage.setItem("API_TOKEN", apiToken)
        //     dispatch({ type: allActions.GET_USERS_SUCCESS, payload: data })
            
        //     set_loading(false)
        // }
        // else if (res.success == false) {

        //     set_loading(false)
        //     Helpers.showToast(res.error)
        // } else {
        //     set_loading(false)
        // }
        AsyncStorage.setItem("API_TOKEN", users&&users.data.api_token)

        const temp=AsyncStorage.getItem('API_TOKEN')

        console.log('Token is======',temp)
        return () => { isMounted = false };


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


    }

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

        <View style={styles.container}>
            <View>
                <Image source={Helpers.Images.logInLogo} resizeMode="contain" style={styles.registerLogo} />
            </View>
            <View style={{ marginTop: hp(2) }}>
                <Formik
                    validationSchema={LoginSchema}
                    initialValues={{ email: '', password: '' }}
                    onSubmit={handleSubmit}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, touched, errors, isValid, setFieldTouched }) => (
                        <>
                            <View>
                                <TextInput
                                    style={styles.inputTxt}
                                    placeholder=" Email address"
                                    placeholderTextColor={Helpers.Colors.lightTxt}
                                    value={values.email}
                                    autoCapitalize={'none'}
                                    onChangeText={handleChange('email')}
                                    autoCorrect={false}
                                    // maxLength={20}
                                    onBlur={() => setFieldTouched('email')} />
                                {
                                    touched.email && errors.email &&
                                    <Text style={styles.formikTxtError}>{errors.email}</Text>
                                }
                            </View>
                            <View>
                                <TextInput
                                    style={styles.inputTxt}
                                    placeholder="Password"
                                    placeholderTextColor={Helpers.Colors.lightTxt}
                                    value={values.password}
                                    autoCapitalize={'none'}
                                    onChangeText={handleChange('password')}
                                    autoCorrect={false}
                                    maxLength={20}
                                    onBlur={() => setFieldTouched('password')} />

                                {
                                    touched.password && errors.password &&
                                    <Text style={styles.formikTxtError}>{errors.password}</Text>
                                }
                            </View>

                            <TouchableOpacity style={{ width: wp('80'), justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: hp(1) }}>
                                <Text style={{ fontSize: 12, color: Helpers.Colors.lightTxt }}>Forgot Password ?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.registerBtn} onPress={handleSubmit}>
                                <Text style={styles.buttonTxt}>Sign In</Text>
                            </TouchableOpacity>

                            {loading && <Helpers.Indicator color={Helpers.Colors.primary} />}

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

        </View>
    );
};

export default Login;

const styles = StyleSheet.create({

    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Helpers.Colors.light },
    inputTxt: { width: wp('90'), height: hp(6), backgroundColor: Helpers.Colors.inputFieldBg, marginTop: hp(1), marginBottom: hp(1), borderRadius: hp(1), padding: wp(2) },
    registerLogo: { width: wp('80'), height: hp('35') },
    registerBtn: { justifyContent: 'center', alignItems: 'center', width: wp('90'), height: hp(6), borderRadius: hp('1'), backgroundColor: Helpers.Colors.primary, marginTop: hp(2) },
    buttonTxt: { color: Helpers.Colors.light },
    lineSpt: { width: wp(32), height: hp(0.04), backgroundColor: Helpers.Colors.lightTxt },
    socialBtn: { justifyContent: 'center', alignItems: 'center', width: wp('90'), flexDirection: 'row', height: hp(6), borderRadius: hp('1'), borderColor: Helpers.Colors.lightTxt, borderWidth: hp(0.04), marginTop: hp(2) },
    socialBtnTxt: { color: Helpers.Colors.dark },
    socialLogo: { width: wp(6), height: hp(8), marginRight: wp(2) },
    formikTxtError: { fontSize: 12, color: Helpers.Colors.red }

});