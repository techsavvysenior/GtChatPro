import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Linking } from 'react-native'
import Modal from "react-native-modal";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as Helpers from '../assets/Exporter'
import { useEffect, useState } from 'react';
import { Avatar, Badge } from 'react-native-elements';
import { Alert } from 'react-native';
import Api from '../network/Api';
import { useSelector } from 'react-redux';
import { Platform } from 'react-native';
import io from 'socket.io-client';
import { useNavigation } from '@react-navigation/native';

export default function CallsModal(props) {


      const apiKeySocket = useSelector(state => state.AuthReducer.users.api_key);
      const socket = io('https://socket.agilepusher.com', { 'reconnection': true, 'reconnectionDelay': 50000, 'reconnectionDelayMax': 50000, 'reconnectionAttempts': 3, 'query': { apiKey: apiKeySocket, type: 'gtChatPro' }, transports: ['websocket'], });

      const navigation = useNavigation();

      const users = useSelector((state) => state.AuthReducer.users)
      const client_id = useSelector(state => state.AuthReducer.users.id)
      let count = 0







      useEffect(() => {

            socket.on('disconnect', () => {
                  //     console.log('disconnected');
            });

            socket.on('connect', () => {
                  //     console.log('Inside Chat Screen Connected');
                  initConnectionParams()

                  // addHandlers();
            });



            socket.on('reconnect', () => {

                  //     console.log('Reconnect is Working.');
                  // addHandlers();

            });

      }, []);



      function initConnectionParams(roomID, receiverID, userId) {

            //      console.log('inside init params of agents')
            // console.log('initconnectparams', 'roomId', roomID, 'receiver', receiverID, 'userId', userId);

            // socket.on('agInfoMessage_dev', function (msg) {

            //     console.log('agInfoMessage_dev event from agents screen==>', msg);

            // });
      }










      const updateCallStatus = async (callId) => {
            let params = {
                  call_id: callId?.id
            }
            console.log("call id params===>",params)


            let res = await Api.post(`messenger/update-call`, params);
            console.log('==========>', res)

            if (res.success) {
                  props?.callsListApi()


            } else {

                  Alert.alert(JSON.stringify(res.message))
            }

      }

      const listEmptyRender = () => {
            return (
                  <View style={{ width: wp(100), justifyContent: 'center', alignItems: 'center' }} >
                        <Text style={{ color: "black" }} >No Calls are Scheduled</Text>
                  </View>)
      }



      const showAlert = (item) =>
            Alert.alert(
                  "Confirm Call",
                  `Are you sure you want to call ${item?.phone_number}`,
                  [
                        {
                              text: "Call",
                              onPress: () => {

                                    props.close(false)
                                    Linking.openURL(`tel:${item?.phone_number}`)
                                    // updateCallStatus(item?.id)

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

      if (count <= 0) {
            console.log("modal visible prop is==>", props.isModalVisible)
            return (



                  // <View style={{flex:1}}>

                  <Modal
                        isVisible={props.isModalVisible}
                        style={styles.container}
                        swipeDirection='down'
                        swipeThreshold={hp(25)}
                        backdropColor={Platform.OS == 'android' ? 'black' : 'black'}
                        backdropOpacity={Platform.OS == 'android' ? 0.1 : 0.7}
                        onSwipeComplete={() => { props.close(false) }}
                        onBackButtonPress={() => { props.close(false) }}
                        onBackdropPress={() => {
                              props.close(false)

                        }}
                  >
                        <View style={styles.ModalStyle}>
                              <View style={{ alignItems: 'center' }}>
                                    <TouchableOpacity style={styles.modalCloseTouchableStyle} onPress={() => {
                                          props.close(false)


                                    }} >

                                    </TouchableOpacity>
                              </View>

                              <View style={{}} >
                                    <FlatList
                                          data={props?.callsList}
                                          renderItem={(item) => {
                                                // console.log("call modal items==>", item)

                                                return (
                                                      <View style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', padding: wp(2), flexDirection: 'row', backgroundColor: item.item.status == 0 ? 'rgba(247, 0, 0, 0.2)' : 'rgba(50, 199, 136, 0.2)', marginVertical: hp(1) }}
                                                      >

                                                            <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                                                                  {/* <View>
                                                                              <Avatar
                                                                                    size={55}
                                                                                    rounded
                                                                                    source={item?.avatar ? { uri: item?.avatar } : require('../assets/images/profile.png')} />
                                                                              <Badge
                                                                                    status={item.item.online_status == 1 ? "success" : "warning"}
                                                                                    badgeStyle={{ height: hp(1.2), width: hp(1.2), borderRadius: hp(2) / 2 }}
                                                                                    containerStyle={{ top: hp(-1.8), left: wp(4) }} />


                                                                        </View> */}
                                                                  <View style={{ marginStart: wp(3), height: hp(7), justifyContent: 'center' }}>
                                                                        <Text style={{ color: Helpers.Colors.dark, fontSize: 14, marginTop: hp(0), fontWeight: '700' }}>{item.item.time}</Text>
                                                                        {/* <Text style={{ color: Helpers.Colors.lightTxt, fontSize: 12, marginTop: hp(1) }}>{item.subTxt}</Text> */}
                                                                  </View>

                                                            </View>
                                                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>

                                                                  <TouchableOpacity style={{ width: wp(20), height: hp(4), borderRadius: 20 / 2, backgroundColor: Helpers.Colors.primary, justifyContent: 'center', alignItems: 'center' }}
                                                                        onPress={() => {
                                                                              if(item?.item?.status==0){

                                                                                    updateCallStatus(item?.item)
                                                                              }
                                                                        }}
                                                                        disabled={item?.item?.status==0?false:true}

                                                                  >
                                                                        <Text style={{ fontSize: 12, color: Helpers.Colors.light }}>{item?.item?.status==0?"Pending":"Completed"}</Text>
                                                                  </TouchableOpacity>
                                                            </View>

                                                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>

                                                                  <TouchableOpacity style={{ width: wp(15), height: hp(4), borderRadius: 20 / 2, backgroundColor: Helpers.Colors.primary, justifyContent: 'center', alignItems: 'center' }}
                                                                        onPress={() => showAlert(item?.item)}

                                                                  >
                                                                        <Text style={{ fontSize: 12, color: Helpers.Colors.light }}>Call</Text>
                                                                  </TouchableOpacity>
                                                            </View>
                                                      </View>
                                                );
                                          }
                                          }
                                          //   keyExtractor={(item)=>item.id}
                                          style={{ width: '100%', padding: wp(2), marginTop: hp(2) }}
                                          ItemSeparatorComponent={() => (<View style={{ backgroundColor: Helpers.Colors.itemSeparator, height: 1, width: wp(100) }} />)}
                                          ListEmptyComponent={listEmptyRender}
                                    //    keyExtractor={item => item.id}
                                    />
                              </View>


                        </View>
                  </Modal>
                  // </View>





            );
      }
      else {
            return null;
      }
}

const styles = StyleSheet.create({

      container: {
            height: hp(90),
            backgroundColor: 'transparent'
      },
      ModalStyle: {
            backgroundColor: 'white',
            width: wp(100),
            height: hp(90),
            marginLeft: wp(-5),
            marginTop: hp(10),
            paddingVertical: hp(4),
            borderRadius: 15,
            // borderTopRightRadius: 15 
      },
      modalCloseTouchableStyle: {
            height: hp(0.5),
            width: wp(20),
            backgroundColor: '#B8B8B8',
            borderRadius: 20,
            alignItems: 'center',
            // marginHorizontal:wp(35),
            marginTop: hp(-3)
      }

})
