import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import * as Helpers from '../assets/Exporter';

const Welcome = () => {

    return (

        <View style={styles.container}>

            <View>
                <Image source={Helpers.Images.welcomeLogo} resizeMode="contain" style={styles.welcomeLogo} />
            </View>
            <View style={{ marginTop: hp(3) }}>
                <Text style={styles.welcomeTxt} >Welcome To</Text>
            </View>
            <View>
                <Image source={Helpers.Images.appLogo} resizeMode="contain" style={styles.appLogo} />
            </View>

            <View>
                <Text style={styles.detailTxt}>{'All-in-one business messenger\n to engage with customers everywhere'}</Text>
            </View>

            <TouchableOpacity style={[styles.submitButton, { backgroundColor: Helpers.Colors.secondary, marginTop: hp(5) }]}>
                <Text style={styles.buttonTxt}>Register</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.submitButton, { backgroundColor: Helpers.Colors.primary, marginTop: hp(2) }]}>
                <Text style={styles.buttonTxt}>Sign In</Text>
            </TouchableOpacity>


        </View>
    );
};
export default Welcome;

const styles = StyleSheet.create({

    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Helpers.Colors.light },
    submitButton: { justifyContent: 'center', alignItems: 'center', width: wp('90'), height: hp(6), borderRadius: hp('1'), },
    buttonTxt: { color: Helpers.Colors.light },
    welcomeTxt: { fontSize: 22, fontWeight: 'bold', color: 'black' },
    welcomeLogo: { width: wp('80'), height: hp('40') },
    appLogo : { width: wp('45'), height: hp('10') },
    detailTxt : { textAlign: 'center', lineHeight: hp(3), color: Helpers.Colors.lightTxt } 

});