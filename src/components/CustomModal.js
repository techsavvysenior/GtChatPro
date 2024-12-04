import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import Modal from "react-native-modal";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as Helpers from '../assets/Exporter'
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';




export default function CustomModal(props) {
      const [isModalVisible, setModalVisible] = useState(false)

      const toggleModal = () => {
            setModalVisible(!isModalVisible);
      };


      return (



            <View style={{ flex: 1 }}>

                  <Modal isVisible={props.isModalVisible}
                        style={styles.container}
                        backdropColor={Platform.OS=='android'?'black':'black'}
                        backdropOpacity={Platform.OS=='android'?0.1:0.7}
                        onBackdropPress={props.close}
                  >
                        <View style={{ backgroundColor: 'white', width: wp(100), height: hp(15), marginLeft: wp(-5), marginTop: hp(85), paddingVertical: hp(4), borderTopLeftRadius: 15, borderTopRightRadius: 15 }}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                    {props.primaryButton && (
                                          <TouchableOpacity style={styles.primaryToucable} onPress={props?.onPressPrimary}  >
                                                <Text style={{ color: 'white', fontSize: hp('2') }} > {props.primaryButtonLabel}</Text>
                                          </TouchableOpacity>

                                    )}

                                    {props.secondaryButton && (

                                          <TouchableOpacity style={styles.secondaryTouchable} onPress={props?.onPressSecondary} >
                                                <Text style={{ color: 'white', fontSize: hp('2') }} > {props.secondaryButtonLabel}</Text>
                                          </TouchableOpacity>
                                    )}
                              </View>

                        </View>
                  </Modal>
            </View>





      );
}

const styles = StyleSheet.create({

      container: {
            height: 250,
            backgroundColor:'transparent'
      },
      primaryToucable: {
            width: wp(45), 
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
            width: wp(45), 
            height: hp(5), 
            backgroundColor: '#B8B8B8',
             alignItems: 'center',
              justifyContent: 'center', 
              borderRadius: 10,
            //    elevation: 2
            shadowColor: "#000",
            shadowOffset: {
                      width: 0,
                      height: 2,
                    },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
    
            elevation: 5,
            
      }

})
