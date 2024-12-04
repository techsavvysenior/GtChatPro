import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, FlatList,ActivityIndicator } from 'react-native';

import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Avatar, Badge } from 'react-native-elements';
import * as Helpers from '../assets/Exporter';
import CustomModal from './CustomModal';
import AgentsModal from './AgentsModal';

const ChatList = (props) => {

      const { chatList, navigation } = props


      const [isModalVisible, setModalVisible] = useState(false);
    const [isAgentsModalVisible, setAgentsModalVisible] = useState(false);
      const [clickedItem, set_clickedItem] = useState([]);
      const [activityLoading,setActivityLoading]=useState(false)
      // const [displayDate, setDisplayDate] = useState('');


      const toggleModal = (item) => {
          set_clickedItem(item)
        setModalVisible(!isModalVisible);
      };

      const renderMembers = ({ item }) =>

{     

      var str = item.recent_message_sent_at;

      var dateStr = str.substring(11, 16);

      

//      console.log("TIME item===>",res)
//       const date= new Date(item.recent_message_sent_at)  

//       const d= new Date(date)
//       var hours = res.substring(0) > 12 ? date.getHours() - 12 : date.getHours();
//       var am_pm = date.getHours() >= 12 ? "PM" : "AM";
//       const dateStr=`${hours}:${d.getMinutes()} ${am_pm}`

//       console.log('date str====>',d)
      
      
      //For Message Count
      // var count=0;
      // let msgArray=item.messages
      // msgArray.forEach(element => {
      //       if(element.seen_status==0){
      //             // console.log('zero')
      //             count=count+1
            
      //       }else{
      //             console.log('seen')
      //       }
      // });

      // console.log(`count of ${item.id}====>`,count)

      


     return (
            <View>
            <TouchableOpacity style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', padding: wp(2), flexDirection: 'row' }}
            //  onPress={() => navigation.navigate('Chat', {item:item,fromArchieve:false})}
            onPress={()=>{toggleModal(item)}} 
             >
                  <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                        <View>
                              <Avatar
                                    size={55}
                                    rounded
                                    source={{ uri: item.avatar }} />
                                                                                 {item.user_status==1&&( <Badge
                status="success"
                containerStyle={{ position: 'absolute', top: hp(5), right: wp(0), }} />
)}
                        </View>
                        <View style={{ marginStart: wp(3) }}>
                              <Text style={{ color: Helpers.Colors.dark, fontSize: 14, marginTop: hp(1), fontWeight: '700' }}>{item?.visitor?.name?item?.visitor?.name:item.user_id}</Text>
                              <Text style={{ color: Helpers.Colors.lightTxt, fontSize: 12, marginTop: hp(1) }}>{item.subTxt}</Text>
                        </View>
                  </View>
                  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                              <Text style={{ color: Helpers.Colors.lightTxt, fontSize: 12 }}>{dateStr}</Text>
                        </View>
                        {/* <View style={{ width: 20, height: 20, borderRadius: 20 / 2, backgroundColor: Helpers.Colors.primary, justifyContent: 'center', alignItems: 'center', marginTop: hp(1) }}>
                              <Text style={{ fontSize: 12, color: Helpers.Colors.light }}>{count}</Text>
                        </View> */}
                  </View>
            </TouchableOpacity>
                   
                   
            <CustomModal 
               isModalVisible={isModalVisible} 
               close={()=>{setModalVisible(false)}}
               primaryButton={true}
            //    primaryButtonLabel={clickedItem?.visitor?.name?clickedItem?.visitor?.name:clickedItem.user_id}
               primaryButtonLabel="Start Chat"
               onPressPrimary={() => {
                   props.navigation.navigate('Chat',{item:clickedItem,fromArcieve:false})
                                        setModalVisible(false)}
                                    }

               secondaryButton={true}
               secondaryButtonLabel="Transfer Chat"
               onPressSecondary={()=>{
                setModalVisible(false);
               const timeout= setTimeout(() => {
                    setAgentsModalVisible(true)
                    clearTimeout(timeout)
                }, 600);
               }}

               
               />

                {/* Modal CODE END */}
                
                <AgentsModal 
               isModalVisible={isAgentsModalVisible} 
               close={setAgentsModalVisible}
               itemsList={clickedItem}
               />

            </View>
      );
}
      return (


            chatList.length != [] ?

                  <FlatList
                        data={chatList}
                        renderItem={renderMembers}
                        style={{ width: '100%', padding: wp(2), marginTop: hp(2) }}
                        ItemSeparatorComponent={() => (<View style={{ backgroundColor: Helpers.Colors.itemSeparator, height: 1, width: wp(100) }} />)}
                        keyExtractor={item => item.id}
                        onEndReachedThreshold={1}
                        onEndReached={()=>{

                              // console.log('reached end')
                        }}
                  />

                  : <Helpers.Indicator color={Helpers.Colors.primary} />

      )

}

export default ChatList

