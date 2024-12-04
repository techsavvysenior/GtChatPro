
import React from 'react';
import { View } from 'react-native';
import { StyleSheet,Alert} from 'react-native';
import { SkypeIndicator, DotIndicator } from 'react-native-indicators';
import Toast from 'react-native-simple-toast'

export const Indicator = (props) => {
    return (
        <View style={props.style}>
        <SkypeIndicator color ={props.color} style ={[styles.indicatorStyle]} />
        </View>
    );
};
export const showToast = (msg) => {
    // Toast.show(msg, {
    //     duration: Toast.durations.LONG,
    //     position: Toast.positions.BOTTOM,
    //     shadow: true,
    //     animation: true,
    //     hideOnPress: true,
    //     delay: 0,
    // });
    Toast.show(msg)
    
};
export const getConfirmation = (title, msg, callback) => {
    Alert.alert(
        title,
        msg,
        [
            {
                text: 'Cancel',
                style: 'cancel'
            },
            { text: 'OK', onPress: callback }
        ],
        { cancelable: false }
    );
};

const styles= StyleSheet.create({
    indicatorStyle :{  
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center' 
    }
});
