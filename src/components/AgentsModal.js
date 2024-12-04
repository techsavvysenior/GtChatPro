import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native'
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



const agentsArray = [{ "id": 1, "name": "test 1" }, { "id": 2, "name": "test 2" }, { "id": 3, "name": "test 3" }, { "id": 4, "name": "test 4" }, { "id": 5, "name": "test 5" }, { "id": 6, "name": "test 6" }];


export default function AgentsModal(props) {


      const apiKeySocket = useSelector(state => state.AuthReducer.users.api_key);
      const socket = io('https://socket.agilepusher.com', { 'reconnection': true, 'reconnectionDelay': 50000, 'reconnectionDelayMax': 50000, 'reconnectionAttempts': 3, 'query': { apiKey: apiKeySocket, type: 'gtChatPro' }, transports: ['websocket'], });

      const BASE_URL = 'BASE_URL';

      const navigation = useNavigation();

      const [rerender, setReRender] = useState(false)
      const [agentsList, set_agentsList] = useState([]);

      const users = useSelector((state) => state.AuthReducer.users)
      const client_id = useSelector(state => state.AuthReducer.users.id)
      let count = 0


      const reRenderFunc = () => {
            setReRender(!rerender);
      };

      // useEffect(() => {
      //       // alert('rerender')
      //       console.log('agents modal')
      //       console.log('rerender==>',rerender)
      //       getAgents();

      //       return () => {
      //             set_agentsList([]); // This worked for me
      //           };


      // },[rerender])


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






      // const getAgents = async () => {
      //       // console.log('into agents api')
      //       // set_loading(true);
      //       let res = await Api.get(`messenger/all-agents?api_key=${users.api_key}`);
      //       // console.log(res)
      //       if (res.code==200) {
      //       //     console.log("Agents List Is==>",res.agents)
      //           let agentsList = res?.agents;
      //           set_agentsList(agentsList);
      //       //     set_loading(false);
      //       }
      //       else {
      //       //     set_loading(false);
      //             // Helpers.showToast("Something Went Wrong")
      //       }


      //   };




      const getAgents = async () => {

            // console.log('into agents api func')
            count = 1


            const options = {
                  method: 'GET',
                  headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${users.api_token}`
                  }
            }

            fetch(`${BASE_URL}/messenger/all-agents?api_key=${users.api_key}`, options)
                  .then(response => response.text())
                  .then(result => {
                        let res = JSON.parse(result)
                        // console.log("agents api result", res)
                        if (res.code == 200) {
                              //     console.log("Agents List Is==>",res.agents)
                              let agentsList = res?.agents;
                              set_agentsList(agentsList);
                              count = 0
                              //     set_loading(false);
                        }


                  })
                  .catch((error) => {
                        // console.log('error', error)
                        count = 0
                        // Helpers.showToast('Image Not Sent')

                  });




      }




      const transferChat = async (chatId, agentId, visitor_id) => {

            let params = {
                  chat_id: chatId,
                  agent_id: agentId
            }
            let res = await Api.post('messenger/transfer-chat', params)
            // console.log('==========>',res)
            if (res.success) {
                  alert("Transfer Successfull")
                  // let msg = "transferchat-" + chatId + "-" + visitor_id + "-" + agentId;
                  // console.log("msg params=========>",msg)
                  // socket.emit('agInfoMessage_dev', msg);
                  let msg = "transferchat-" + chatId + "-" + visitor_id + "-" + agentId;
                  socket.emit('agInfoMessage_dev', msg);
                  // navigation.goBack();



            } else {

                  Alert.alert(JSON.stringify(res.message))
            }

      }




      const showAlert = (item) =>
            Alert.alert(
                  "Confirm Chat Transfer",
                  `Do You Want to Transfer this Chat to ${item?.name}`,
                  [
                        {
                              text: "Confirm",
                              onPress: () => {
                                    console.log("Transfered Chat Id is==>", props.itemsList.id),
                                          props.close(false)
                                    // reRenderFunc();
                                    transferChat(props.itemsList?.id, item?.id, props.itemsList.user_id)

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
            return (



                  <View style={{}}>

                        <Modal isVisible={props.isModalVisible}
                              style={styles.container}
                              swipeDirection='down'
                              swipeThreshold={hp(25)}
                              backdropColor={Platform.OS == 'android' ? 'black' : 'black'}
                              backdropOpacity={Platform.OS == 'android' ? 0.1 : 0.7}
                              onSwipeComplete={() => { props.close(false) }}
                              onBackButtonPress={() => { props.close(false) }}
                              onBackdropPress={() => {
                                    props.close(false)
                                    // reRenderFunc();
                              }}
                        >
                              <View style={styles.ModalStyle}>
                                    <View style={{ alignItems: 'center' }}>
                                          <TouchableOpacity style={styles.modalCloseTouchableStyle} onPress={() => {
                                                props.close(false)
                                                // reRenderFunc();

                                          }} >

                                          </TouchableOpacity>
                                    </View>

                                    <View style={{}} >
                                          <FlatList
                                                data={props?.agentsList}
                                                renderItem={(item) => {
                                                      console.log("item==>", item)
                                                      return (


                                                            <View style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', padding: wp(2), flexDirection: 'row', }}
                                                            //  onPress={() => props.navigation.navigate('Chat',item)}
                                                            // onPress={()=>{toggleModal(item)}} 
                                                            //     onPress={()=>{console.log(item?.item?.name)}}


                                                            >

                                                                  <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                                                                        <View>
                                                                              <Avatar
                                                                                    size={55}
                                                                                    rounded
                                                                                    source={item?.avatar ? { uri: item?.avatar } : require('../assets/images/profile.png')} />
                                                                              <Badge
                                                                                    status={item.item.online_status == 1 ? "success" : "warning"}
                                                                                    badgeStyle={{ height: hp(1.2), width: hp(1.2), borderRadius: hp(2) / 2 }}
                                                                                    containerStyle={{ top: hp(-1.8), left: wp(4) }} />


                                                                        </View>
                                                                        <View style={{ marginStart: wp(3) }}>
                                                                              <Text style={{ color: Helpers.Colors.dark, fontSize: 14, marginTop: hp(0), fontWeight: '700' }}>{item.item.name}</Text>
                                                                              <Text style={{ color: Helpers.Colors.lightTxt, fontSize: 12, marginTop: hp(1) }}>{item?.item?.department?.name}</Text>
                                                                        </View>

                                                                  </View>
                                                                  <View style={{ alignItems: 'center', justifyContent: 'center' }}>

                                                                        <TouchableOpacity style={{ width: wp(20), height: hp(4), borderRadius: 20 / 2, backgroundColor: Helpers.Colors.primary, justifyContent: 'center', alignItems: 'center' }}
                                                                              onPress={() => showAlert(item?.item)}

                                                                        >
                                                                              <Text style={{ fontSize: 12, color: Helpers.Colors.light }}>Transfer</Text>
                                                                        </TouchableOpacity>
                                                                  </View>
                                                            </View>
                                                      );
                                                }
                                                }
                                                //   keyExtractor={(item)=>item.id}
                                                style={{ width: '100%', padding: wp(2), marginTop: hp(2) }}
                                                ItemSeparatorComponent={() => (<View style={{ backgroundColor: Helpers.Colors.itemSeparator, height: 1, width: wp(100) }} />)}
                                          //    keyExtractor={item => item.id}
                                          />
                                    </View>


                              </View>
                        </Modal>
                  </View>





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
