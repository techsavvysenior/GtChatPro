import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { CheckBox, Icon } from 'react-native-elements';

import * as Helpers from '../assets/Exporter';


const Register = () => {

    const [checked, set_checked] = useState(false);

    return (

        <View style={styles.container}>
            <View>
                <Image source={Helpers.Images.registerLogo} resizeMode="contain" style={styles.registerLogo} />
            </View>
            <View style={{ marginTop: hp(2) }}>
                <TextInput
                    style={styles.inputTxt}
                    placeholder=" Email address"
                    placeholderTextColor={Helpers.Colors.lightTxt}
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    maxLength={20} />
            </View>
            <View>
                <TextInput
                    style={styles.inputTxt}
                    placeholder="Password"
                    placeholderTextColor={Helpers.Colors.lightTxt}
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    maxLength={20} />
            </View>
            <View>
                <TextInput
                    style={styles.inputTxt}
                    placeholder="Confirm Password"
                    placeholderTextColor={Helpers.Colors.lightTxt}
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    maxLength={20} />
            </View>
            <View style={{ width: wp('100'), flexDirection: 'row', alignItems: 'center' }}>

                <CheckBox
                    checked={checked}
                    size={18}
                    onPress={() => set_checked(!checked)}
                    checkedColor={Helpers.Colors.primary}
                />
                <Text style={{ fontSize: 12, marginLeft: wp(-4), color: Helpers.Colors.lightTxt }}>I have read and agree to the terms and conditions</Text>

            </View>

            <TouchableOpacity style={styles.registerBtn}>
                <Text style={styles.buttonTxt}>Sign Up</Text>
            </TouchableOpacity>
            <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: hp(2) }}>
                <View style={styles.lineSpt} />
                <Text style={{ marginLeft: wp(1), fontSize: 12, marginRight: wp(1), color: Helpers.Colors.lightTxt }}>Or SignUp with</Text>
                <View style={styles.lineSpt} />
            </View>

            <TouchableOpacity style={styles.socialBtn}>
                <Image source={Helpers.Images.googleLogo} resizeMode="contain" style={styles.socialLogo} />
                <Text style={styles.socialBtnTxt}>Register with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialBtn}>
                <Image source={Helpers.Images.fbLogo} resizeMode="contain" style={styles.socialLogo} />
                <Text style={styles.socialBtnTxt}>Register with Facebook</Text>
            </TouchableOpacity>




        </View>

    );
};

export default Register;

const styles = StyleSheet.create({

    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Helpers.Colors.light },
    inputTxt: { width: wp('90'), height: hp(6), backgroundColor: Helpers.Colors.inputFieldBg, marginTop: hp(1), marginBottom: hp(1), borderRadius: hp(1), padding: wp(2) },
    registerLogo: { width: wp('80'), height: hp('35') },
    registerBtn: { justifyContent: 'center', alignItems: 'center', width: wp('90'), height: hp(6), borderRadius: hp('1'), backgroundColor: Helpers.Colors.primary },
    buttonTxt: { color: Helpers.Colors.light },
    lineSpt: { width: wp(32), height: hp(0.04), backgroundColor: Helpers.Colors.lightTxt },
    socialBtn: { justifyContent: 'center', alignItems: 'center', width: wp('90'), flexDirection: 'row', height: hp(6), borderRadius: hp('1'), borderColor: Helpers.Colors.lightTxt, borderWidth: hp(0.04), marginTop: hp(2) },
    socialBtnTxt: { color: Helpers.Colors.dark },
    socialLogo: { width: wp(6), height: hp(8), marginRight: wp(2) }

});