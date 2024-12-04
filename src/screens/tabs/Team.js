import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator,RefreshControl } from 'react-native';
import * as Helpers from '../../assets/Exporter';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSelector, useDispatch } from 'react-redux';
import Api from '../../network/Api';
import { allActions } from "../../store/actions/allActions"
import io from 'socket.io-client';
import FastImage from 'react-native-fast-image';
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import {useRoute} from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign'
import AsyncStorage from '@react-native-async-storage/async-storage';




const Team = (props) => {
    const apiKeySocket = useSelector(state => state.AuthReducer.users.api_key);
    const socket = io('https://socket.agilepusher.com', { 'reconnection': true, 'reconnectionDelay': 50000, 'reconnectionDelayMax': 50000, 'reconnectionAttempts': 3, 'query': { apiKey: apiKeySocket, type: 'gtChatPro' }, transports: ['websocket'], });
     
    const { navigation } = props
    const currentRoute = useRoute();


    const dispatch = useDispatch();
    const client_id = useSelector(state => state.AuthReducer.users.id)
    const agent_name=useSelector(state=>state.AuthReducer.users.name)

    const api_Key = useSelector(state => state.AuthReducer.users.api_key);
    const accpetedChats = useSelector(state => state.AuthReducer.AcceptedChats)
    const transeredChatsData = useSelector(state => state.AuthReducer.TransferedReq)

    let stateChats = accpetedChats ? accpetedChats : []
    const [checkAccepted, setCheckAccepted] = useState(stateChats)
    const [loading, set_loading] = useState(false);
    const [btn1, setBtn] = useState("Accept");
    const [activityLoading, setActivityLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)



    const [transferedChats, set_transferedChats] = useState([]);
    const [transferedChatsApiRes, setTransferedChatsApiRes] = useState([]);
    // console.log("transfered chats array==>",transferedChats)


    let currentPage = transferedChatsApiRes?.current_page;




    const updateSeenStatusApi = async (SelectedChat,item) => {

        Helpers.showToast('Accepting Chat')



        set_loading(true)
        let params = { chat_id: SelectedChat }
        let res = await Api.post('messenger/update-all-seen-status', params);

        if (res.success) {
            acceptChatApi(SelectedChat,item)

        } else {
            // Helpers.showToast('Something Went Wrong')
            acceptChatApi(SelectedChat,item)

        }

    }




    const acceptChatApi = async (SelectedChat,item) => {

        console.log("accept chat param=>",SelectedChat)
        console.log("accept chat Item=>",item)



        let params = { api_key: api_Key, chat_id: SelectedChat }
       
        let res = await Api.post('messenger/accept-chat', params);
        // console.log("accept chat res==>",res)
        
        if (res.success) {
            set_loading(false)

            Helpers.showToast('Chat Accepted')
            // socket.emit('agInfoMessage_dev', 'chat accepted');
            let msg = 'chat accepted' + "_" + client_id;
            socket.emit('agInfoMessage_dev', msg);

            var agent_room = `agents_${api_Key}`;


            // socket.emit("accept", agent_room, agent_name, SelectedChat);

            socket.emit("accept", agent_room, {agent_name:agent_name, department_id:res?.department_id}, SelectedChat);

            socket.emit("accepted", `${SelectedChat}`, client_id, SelectedChat);



            setCheckAccepted([...checkAccepted, SelectedChat.toString()])
            dispatch({ type: allActions.ACCEPTED_CHATS, payload: SelectedChat.toString() })
            navigation.navigate('Chat', { item: item, fromArcieve: false })

            
             

        } else {
            Helpers.showToast('Something Went Wrong')
            set_loading(false)

        }

    }

    useEffect(() => {
        getTransferedChats()
    }, [transeredChatsData])

    useEffect(() => {
        // console.log('Accepted updated')
        dispatch({ type: allActions.ACCEPTED_CHATS, payload: checkAccepted })
        getTransferedChats();


    }, [checkAccepted])


    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // console.log('Refreshed!');
            // Function here
            getTransferedChats();
            dispatch({ type: allActions.CURRENT_SCREEN, payload: currentRoute?.name })


        });
        return unsubscribe;
    }, [navigation]);

    const getTransferedChats = async () => {
        // set_loading(true);
        let res = await Api.get('admin/profile/transferred-chats');

        if (res.success) {

                console.log('transfered chats response=>',res)
                // set_loading(false)
            let transferChats = res?.transferred_chats?.data;
            set_transferedChats(transferChats);
            setTransferedChatsApiRes(res.transferred_chats)

        }
        else {

            // set_loading(false)

            if (res.err == "Unauthenticated.") {
                AsyncStorage.removeItem('API_TOKEN')
                dispatch({ type: allActions.LOG_OUT, payload: '' })

            }
        }


    };


    const rejectTransferedChat = async (chatId) => {
    
        set_loading(true);
        let res = await Api.get(`admin/profile/reject-transferred-chat?chat_id=${chatId}`);

        if (res.success) {

                // console.log('transfered chats response=>',res.transferred_chats)
            let transferChats = res.transferred_chats;
            set_transferedChats(transferChats);
            // setTransferedChatsApiRes(res.transferred_chats)
            set_loading(false)


        }
        else {


            if (res.err == "Unauthenticated.") {
                AsyncStorage.removeItem('API_TOKEN')
                dispatch({ type: allActions.LOG_OUT, payload: '' })

            }
            Helpers.showToast('Something Went Wrong')
            set_loading(false)
        }


    };

    const flatlistEmptyComponent=()=>{
        return(
            <View style={{flex:1,height:hp(50),alignItems:'center',justifyContent:'center'}} >
                <Text style={{color:Helpers.Colors.lightTxt,fontSize:hp(2)}} >{ transferedChats?.length==0&& "No Requests Available"}</Text>
            </View>
        );
    }

    const getTransferedChatsPaggination = async (page) => {
        // set_loading(true);
        let res = await Api.get(`admin/profile/transferred-chats?api_key=${api_Key}&page=${page}`);

        if (res.success) {

                // console.log('transfered chats response=>',res.transferred_chats)
            let newChats = res.transferred_chats.data;
            set_transferedChats([...transferedChats,...newChats]);
            setTransferedChatsApiRes(res.transferred_chats)

        }
        else {


            if (res.err == "Unauthenticated.") {
                AsyncStorage.removeItem('API_TOKEN')
                dispatch({ type: allActions.LOG_OUT, payload: '' })

            }
        }


    };


    const renderFlatlistFooter = () => {
        if(transferedChatsApiRes.data&&transferedChatsApiRes.data.length==0){
            
            return null
        }

        if (activityLoading) {
            return (

                <SkeletonPlaceholder>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ height: hp(7), width: hp(7), borderRadius: (hp(7) * hp(7) / 2) }} >

                        </View>
                        <View style={{ height: hp(6.5), width: wp(80), backgroundColor: 'red', marginLeft: 3 }}>

                        </View>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ height: hp(7), width: hp(7), borderRadius: (hp(7) * hp(7) / 2) }} >

                        </View>
                        <View style={{ height: hp(6.5), width: wp(80), backgroundColor: 'red', marginLeft: 3 }}>

                        </View>
                    </View>
                </SkeletonPlaceholder>
            );
        } else {
            return null;
        }

    }


    // const EmptyListMessage = ({ item }) => {
    //     if(!loading){
    //     return (
    //       // Flat List Item
    //       <View style={{height:hp(20),width:wp(100),alignItems:'center',justifyContent:'center'}}>
    //       <Text style={{fontSize:hp(3),color:'black'}}>
    //         No Data Found
    //       </Text>
    //       </View>
    //     );
    //     }
    //     else{
    //         return null
    //     }
    //   };



    const renderMembers = ({ item }) => {
     

        return (

            <View>
                <View style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', padding: wp(4), flexDirection: 'row' }}

                >
                    <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                        <FastImage
                            style={{ height: hp(6.5), width: hp(6.5) }}

                            source={{ uri: item?.avatar }} />

                        <View style={{ marginStart: wp(3) }}>
                            <Text style={{ color: Helpers.Colors.dark, fontSize: 14, marginTop: hp(1), fontWeight: '700' }}>{item?.visitor?.name ? item?.visitor?.name : item.user_id}</Text>
                            {/* <Text style={{ color: Helpers.Colors.lightTxt, fontSize: 12, marginTop: hp(1) }}>{item.subTxt}</Text> */}
                        </View>
                    </View>
                    <View style={{ alignItems: 'center', justifyContent: 'center',flexDirection:'row' }}>
                        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', height: hp(3.5), width: hp(3.5), borderRadius: 6,right:hp(1) }}
                            onPress={() => { updateSeenStatusApi(item.id,item) }}
                             >
                                <AntDesign name="checksquare" color={Helpers.Colors.primary} size={hp(3.5)} />
                        </TouchableOpacity>

                        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', height: hp(3.5), width: hp(3.5), borderRadius: 6 ,left:hp(1)}}
                            onPress={() => { rejectTransferedChat(item.id) }}
                             >
                                <AntDesign name="closesquare" color={Helpers.Colors.red} size={hp(3.5)} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }








    return (
        <View style={styles.container}>
            <View style={styles.headerVw}>
                <View>
                    <Image source={Helpers.Images.appLogo} resizeMode="contain" style={styles.gtLogo} />
                </View>
            </View>

            <View style={{ width: wp(100), paddingHorizontal: hp(2) }}>
                <Text style={{ color: 'black', fontSize: 15, fontWeight: '600' }} >Transfer Chat Requests</Text>
            </View>
            
            {loading ? (
            <View style={{ height: hp(80), alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={Helpers.Colors.primary} />
                </View>) :

                

                <FlatList
                    // data={uniqueArray}
                    data={transferedChats}
                    renderItem={renderMembers}
                    style={{ width: '100%', padding: wp(2), marginTop: hp(2) }}
                    ItemSeparatorComponent={() => (<View style={{ backgroundColor: Helpers.Colors.itemSeparator, height: 1, width: wp(100) }} />)}
                    keyExtractor={item => item.id}
                    // ListFooterComponent={renderFlatlistFooter}
                    onEndReachedThreshold={1}
                    ListEmptyComponent={flatlistEmptyComponent}
                    onEndReached={() => {
                        // flatlistEnd();
                        if (currentPage < transferedChatsApiRes.last_page) {
                            currentPage = currentPage + 1
                            getTransferedChatsPaggination(currentPage)
                        }
                        if (transferedChatsApiRes.next_page_url == null) {
                            setActivityLoading(false)

                        }

                    }}

                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                getTransferedChats();
                            }}
                        />
                    }

                />
            }
        </View>
    );
};
export default Team;

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', backgroundColor: Helpers.Colors.light },
    gtLogo: { width: wp(30) },
    headerVw: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: wp(3), height: hp(12) },


});