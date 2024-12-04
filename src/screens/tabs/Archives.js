import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import * as Helpers from '../../assets/Exporter';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Avatar, Badge } from 'react-native-elements';
import io from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import Api from '../../network/Api';
import FastImage from 'react-native-fast-image'
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { allActions } from "../../store/actions/allActions"
import { useRoute } from '@react-navigation/native';
import { ArchiveData, VisitorData } from '../../store/actions/AuthActions';
import moment from 'moment';





const Archives = (props) => {


    const apiKeySocket = useSelector(state => state.AuthReducer.users.api_key);
    const socket = io('https://socket.agilepusher.com', { 'reconnection': true, 'reconnectionDelay': 50000, 'reconnectionDelayMax': 50000, 'reconnectionAttempts': 3, 'query': { apiKey: apiKeySocket, type: 'gtChatPro' }, transports: ['websocket'], });

    const { navigation } = props
    const dispatch = useDispatch();
    const currentRoute = useRoute();


    const apiKey = useSelector(state => state.AuthReducer.users.api_key);
    const client_id = useSelector(state => state.AuthReducer.users.id)
    const agent_name = useSelector(state => state.AuthReducer.users.name)
    const archivesData = useSelector(state => state.AuthReducer.archiveSuccessData);
    const visitorsData = useSelector(state => state.AuthReducer.visitorSuccessData);
    const isLoading = useSelector(state => state.AuthReducer.loading);
    console.log("isLoading", isLoading)
    console.log("archives data", archivesData)



    const [archiveChats, set_archiveChats] = useState([]);
    const [visitors, set_visitors] = useState([]);
    const [loading, set_loading] = useState(false);

    const [refreshing, setRefreshing] = useState(false)




    const [visitorsApiRes, setVisitorsApiRes] = useState([]);
    const [archieveApiRes, setArchieveApiRes] = useState([]);
    const [activityLoading, setActivityLoading] = useState(true)
    const [activityLoadingVisitor, setActivityLoadingVisitor] = useState(true)


    let currentVisitorsPage = visitorsApiRes?.current_page;

    let currentArchievePage =
        // contactsData?.agent_chats?.current_page
        archieveApiRes?.current_page;
    // let currentArchievePage=archieveApiRes?.current_page;

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            //   console.log('Refreshed!');

            // let archiveParams={
            //     api_key:apiKey,
            //     page:1
            // }
            // dispatch(ArchiveData(archiveParams))

            // console.log("useeffect focus archive====>",archivesData)
            // set_archiveChats(archivesData?.archived_chats?.data)
            // setArchieveApiRes(archivesData?.archived_chats)

            //   getMembers();
            //   getVisitorsChat(); 
            dispatch({ type: allActions.CURRENT_SCREEN, payload: currentRoute?.name })


        });
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        // console.log("contact data useeffect")


        if (archivesData?.err == "Unauthenticated.") {
            AsyncStorage.removeItem('API_TOKEN')
            dispatch({ type: allActions.LOG_OUT, payload: '' })
        }


        set_archiveChats(archivesData?.archived_chats?.data)
        setArchieveApiRes(archivesData?.archived_chats)
    }, [archivesData])



    useEffect(() => {
        // console.log("Visitor data useeffect")
        set_visitors(visitorsData?.visitors?.data);
        setVisitorsApiRes(visitorsData?.visitors)
    }, [visitorsData])




    useEffect(() => {
        let Params = {
            api_key: apiKey,
            page: 1
        }
        dispatch(ArchiveData(Params))

        // console.log("useeffect focus archive====>",archivesData)
        set_archiveChats(archivesData?.archived_chats?.data)
        setArchieveApiRes(archivesData?.archived_chats)
        // return () => {
        //     cleanup
        // }

        dispatch(VisitorData(Params))

        set_visitors(visitorsData?.visitors?.data);

        setVisitorsApiRes(visitorsData?.visitors)


    }, [])




    const getMembers = async () => {
        set_loading(true);
        let res = await Api.get('admin/profile/archived-chats');

        if (res.success) {
            set_loading(false);


            let archiveChats = res?.archived_chats?.data;
            set_archiveChats(archiveChats);
            setArchieveApiRes(res.archived_chats)

        }
        else {

            set_loading(false);

            if (res.err == "Unauthenticated.") {
                AsyncStorage.removeItem('API_TOKEN')
                dispatch({ type: allActions.LOG_OUT, payload: '' })

            }
        }


    };



    const getMembersNew = async () => {
        // set_loading(true);
        let res = await Api.get('admin/profile/archived-chats');

        if (res.success) {
            // set_loading(false);


            let archiveChats = res?.archived_chats?.data;
            set_archiveChats(archiveChats);
            setArchieveApiRes(res.archived_chats)

        }
        else {

            // set_loading(false);

            if (res.err == "Unauthenticated.") {
                AsyncStorage.removeItem('API_TOKEN')
                dispatch({ type: allActions.LOG_OUT, payload: '' })

            }
        }


    };


    const getArchieveChatsPagination = async (page) => {
        set_loading(true);

        let res = await Api.get(`admin/profile/archived-chats?api_key=${apiKey}&page=${page}`);
        if (res.success) {
            set_loading(false);

            let archiveChatsData = res?.archived_chats?.data;
            set_archiveChats([...archiveChats, ...archiveChatsData]);
            setArchieveApiRes(res?.archived_chats)


        }
        else {
            set_loading(false);

        }


    };

    const getVisitorsChat = async () => {

        let res = await Api.get('admin/profile/visitor-chats');
        if (res.success) {

            let visitors = res?.visitors?.data;
            set_visitors(visitors);
            setVisitorsApiRes(res.visitors)


        }
        else {

        }
    };

    const getVisitorsChatPagination = async (page) => {

        let res = await Api.get(`admin/profile/visitor-chats?api_key=${apiKey}&page=${page}`);
        if (res.success) {

            let visitorsData = res?.visitors?.data;
            set_visitors([...visitors, ...visitorsData]);
            setVisitorsApiRes(res.visitors)

        }
        else {

        }


    };


    const flatlistEmptyComponent = () => {
        return (
            <View style={{ flex: 1, height: hp(50), alignItems: 'center', justifyContent: 'center' }} >
                <Text style={{ color: Helpers.Colors.lightTxt, fontSize: hp(2) }} >{archivesData?.archived_chats?.data?.length == 0 && "No Chats Avaiable"}</Text>
            </View>
        );
    }



    useEffect(() => {

        socket.on('disconnect', () => {
            console.log('disconnected');
        });

        socket.on('connect', () => {
            console.log('Inside Archive Screen Connected');
            AsyncStorage.setItem("socketConnect","true")
            initConnectionParams()
            getNewMessage()
            socketDevInfo()
            // addHandlers();
        });


        socket.on('reconnect', () => {

            console.log('Reconnect is Working.');
            // addHandlers();

        });

    }, []);

    function socketDevInfo() {
        socket.on('agInfoMessage_dev', function (msg) {

            // console.log('agInfoMessage_dev event from Contact screen==>', msg);
            if (msg != null) {
                if (msg.includes('chat accepted')) {
                    // console.log('accepted chat socket')
                    // getMembersNew();
                    let Params = {
                        api_key: apiKey,
                        page: 1
                    }
                    dispatch(ArchiveData(Params))
                    // getVisitorsChat();
                    dispatch(VisitorData(Params))

                }
            }



        })

    }

    function initConnectionParams(roomID, receiverID, userId) {

        // console.log('initconnectparams from archive screen')
        let user_id = client_id;

        socket.on('agAskedToJoin', function (room, receiver) {


            let myObj = visitors.find(obj => obj.id === room)
            if (myObj == 'undefined' || myObj == null && receiver == client_id) {

                //  console.log('got a new visitor')
                //  getVisitorsChat();
                let Params = {
                    api_key: apiKey,
                    page: 1
                }
                dispatch(VisitorData(Params))

            } else {
                //  console.log('Not a new Visitor')
            }


            if (room) {
                // console.log("archieve screen room id==>", room)
                //   LocalNotifications()
            }
            if (user_id == receiver) {

                // console.log('inside emit joined form archieve screen');
                socket.emit('agRoomJoined', room, user_id, '');
            }
            // getNewMessage();

        });
    }

    function getNewMessage() {


        socket.on('reject', function (agent_name, chatID) {
            // getMembersNew();
            let Params = {
                api_key: apiKey,
                page: 1
            }
            dispatch(ArchiveData(Params))
            dispatch(VisitorData(Params))
        });

        socket.on('agGotNewMessage', function (msg, sender, chatId) {

            let myObj = archiveChats.find(obj => obj.user_id === sender)
            // console.log('myObj==>',myObj)
            if (myObj == 'undefined' || myObj == null) {

                // getMembersNew();
                let Params = {
                    api_key: apiKey,
                    page: 1
                }
                dispatch(ArchiveData(Params))
                dispatch(VisitorData(Params))

            } else {
                // console.log('Not a new user')
            }


            // )
        });
    }

    const renderFlatlistFooter = () => {
        if (archieveApiRes?.data && archieveApiRes?.data?.length == 0) {
            // console.log('obj data===>',transferedChatsApiRes.data)
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


    const visitorFlatlistFooter = () => {
        // activityLoadingVisitor
        if (isLoading) {
            return (
                <SkeletonPlaceholder>
                    <View style={{ flexDirection: 'row', marginTop: hp(1.8) }}>

                        <View style={{ height: hp(6), width: hp(6), borderRadius: (hp(7) * hp(7) / 2), marginLeft: wp(2) }} >

                        </View>

                        <View style={{ height: hp(6), width: hp(6), borderRadius: (hp(7) * hp(7) / 2), marginLeft: wp(2) }} >

                        </View>

                        <View style={{ height: hp(6), width: hp(6), borderRadius: (hp(7) * hp(7) / 2), marginLeft: wp(2) }} >

                        </View>

                    </View>
                </SkeletonPlaceholder>
            );
        } else {
            return null;
        }

    }




    const renderOnlineMembers = ({ item }) =>

    (

        <TouchableOpacity style={{ alignItems: 'center', padding: wp(2) }} onPress={() => navigation.navigate('Chat', { item: item, fromArcieve: true })}>
            <Avatar avatarStyle={{ borderColor: Helpers.Colors.primary, borderWidth: wp('0.05') }} source={{ uri: item.avatar }} rounded size={'medium'} />

            {/* <FastImage
                    style={{height:hp(6),width:hp(6)}}
                    source={{ uri: item.avatar }}
                    /> */}
            {item.user_status == 1 && (<Badge
                status="success"
                containerStyle={{ position: 'absolute', top: wp('11'), right: wp('3'), }} />

                // containerStyle={{ position: 'absolute', top: hp(6), right: wp(4.5), }} />
            )}
            <Text numberOfLines={2} ellipsizeMode="tail" style={{ width: wp(15), height: hp(10), fontSize: 12, marginTop: hp(1), color: Helpers.Colors.lightTxt, fontWeight: '500', textAlign: 'center' }}>{item.user_id}</Text>

        </TouchableOpacity>
    );
    const renderMembers = ({ item }) => {

        let time = moment(item.recent_message_sent_at).format('hh:mm A')

        //     var str = item.recent_message_sent_at;
        // //   var msgLength=item.messages.length-1
        //   let count=0;


        //   var timeHour=parseInt(str.substring(11,13))
        //   var ampm;

        //   if(timeHour<12){

        //       ampm="am"
        //   }
        //   else{

        //       ampm="pm"
        //   }

        //   if(timeHour>12){
        //       timeHour=timeHour-12
        //   }


        //   var timeMin=str.substring(13,16)

        var subText;
        if (item?.latest_message?.type == "text" || item?.latest_message?.type == "word") {

            subText = item?.latest_message?.message.length > 29 ? `${item?.latest_message?.message.slice(0, 29)}......` : item?.latest_message?.message
        } else if (item?.latest_message?.type == "voice") {

            subText = "Voice Message"
        } else if (item?.latest_message?.type == "file") {

            subText = "Image"

        } else if (item?.latest_message?.type == "map") {

            subText = "Location"

        }

        //   item.messages.forEach(element => {
        //     if(item.user_id==element.sender)
        //     if(element.seen_status==0){
        //         count++;
        //     }


        //   });


        return (

            <TouchableOpacity
             style={{
                    flex:1, justifyContent: 'space-between', alignItems: 'center', padding: wp('2'), margin: wp('1'),
                    shadowOpacity: wp('0.26'), shadowOffset: { height: 1, width: 1 }, shadowColor: 'rgba(0, 0, 0, 0.04)', elevation: wp('5'), flexDirection: 'row', backgroundColor: "#ffffff", borderRadius: wp('1')
                }}
                // style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', padding: wp(2), flexDirection: 'row' }}
                onPress={() => navigation.navigate('Chat', { item: item, fromArcieve: true })}

            >
                <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                    <View>
                        {/* <Avatar source={{ uri: item.avatar }} rounded size={'medium'} /> */}
                        <FastImage
                            // size={55}
                            // rounded
                            style={{ height: hp(6.5), width: hp(6.5), borderRadius: hp(6.5) / 2, borderColor: Helpers.Colors.primary, borderWidth: wp('0.05') }}

                            source={{ uri: item.avatar }}
                            resizeMode={'cover'} />
                        {/* <FastImage
                            style={{ height: hp(6.5), width: hp(6.5) }}

                            source={{ uri: item.avatar }} /> */}

                        {item.user_status == 1 && (<Badge
                            status="success"
                            containerStyle={{ position: 'absolute', top: hp(5), right: wp(1), }} />

                            // containerStyle={{ position: 'absolute', top: hp(5), right: wp(0), }} />
                        )}
                    </View>
                    <View style={{ marginStart: wp(3) }}>
                        <Text style={{ color: Helpers.Colors.dark, fontSize: 14, marginTop: hp(1), fontWeight: '700' }}>{item?.visitor?.name ? item?.visitor?.name : item.user_id}</Text>
                        <Text style={{ color: Helpers.Colors.lightTxt, fontSize: 12, marginTop: hp(1) }}>{subText}</Text>
                    </View>
                </View>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: Helpers.Colors.lightTxt, fontSize: 12 }}>{time}</Text>
                    </View>
                    {item?.unread_messages_count > 0 && (
                        <View style={{ width: 20, height: 20, borderRadius: 20 / 2, backgroundColor: Helpers.Colors.primary, justifyContent: 'center', alignItems: 'center', marginTop: hp(1) }}>
                            <Text style={{ fontSize: 12, color: Helpers.Colors.light }}>{item?.unread_messages_count}</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    }
    return (


        <View style={styles.container}>
            {/* { loading ? <Helpers.Indicator color={Helpers.Colors.primary} /> : <> */}
            <View style={styles.headerVw}>
                <View>
                    <Image source={Helpers.Images.appLogo} resizeMode="contain" style={styles.gtLogo} />
                </View>

            </View>
            <View style={styles.onlineMembers}>
                <View style={{ padding: wp(2) }}>
                    <Text style={{ color: Helpers.Colors.dark, fontWeight: '700' }}>Visitors</Text>
                </View>
                <FlatList
                    data={visitors}
                    renderItem={renderOnlineMembers}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    ListFooterComponent={visitorFlatlistFooter}
                    onEndReached={() => {

                        if (currentVisitorsPage < visitorsData?.visitors?.last_page) {
                            currentVisitorsPage = currentVisitorsPage + 1
                            getVisitorsChatPagination(currentVisitorsPage)
                        }
                        if (visitorsData?.visitors?.next_page_url == null) {
                            setActivityLoadingVisitor(false)

                        }

                    }}
                //    keyExtractor={item => item.id}
                />
            </View>
            <View style={{ flex: 1,width:wp('100') }}>
                <View style={{ padding: wp(2), margin: wp('2') }}>
                    <Text style={{ color: Helpers.Colors.dark, fontWeight: '700' }}>Chats</Text>
                </View>
                <FlatList
                    data={archiveChats}
                    renderItem={renderMembers}
                    style={{ width: '100%', padding: wp(1), marginBottom: wp('0'), backgroundColor: Helpers.Colors.itemSeparator   }}
                    // style={{ width: wp('100'), padding: wp(1), margin: wp(0), backgroundColor: Helpers.Colors.itemSeparator }}
                    ItemSeparatorComponent={() => (<View style={{ backgroundColor: Helpers.Colors.itemSeparator, height: 1, width: wp(100) }} />)}
                    // ListFooterComponent={renderFlatlistFooter}
                    ListEmptyComponent={flatlistEmptyComponent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {

                                // getMembers()
                                let Params = {
                                    api_key: apiKey,
                                    page: 1
                                }
                                dispatch(ArchiveData(Params))
                                // getVisitorsChat(); 
                                dispatch(VisitorData(Params))
                            }}
                        />
                    }
                    // onEndReachedThreshold={1}
                    scrollEventThrottle={16}

                    onEndReached={() => {

                        if (currentArchievePage < archivesData?.archived_chats?.last_page) {
                            currentArchievePage = currentArchievePage + 1
                            getArchieveChatsPagination(currentArchievePage)
                        }
                        // if(archieveApiRes.next_page_url==null)
                        // {
                        //     setActivityLoading(false)

                        // }
                        if (archivesData?.archived_chats?.next_page_url == null) {
                            setActivityLoading(false)

                        }
                    }}
                //    keyExtractor={item => item.id}
                />
            </View>








            {/* </>
            }
            */}
            {
                loading && <Helpers.Indicator color={Helpers.Colors.primary} style={{ height: hp(100), width: wp(100), backgroundColor: 'rgba(0, 0, 0, 0.1)', position: 'absolute', zIndex: 1 }} />
            }
        </View>


    );
};

export default Archives;

const styles = StyleSheet.create({

    container: { flex: 1, alignItems: 'center', backgroundColor: Helpers.Colors.light },
    headerVw: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: wp(3), height: hp(12) },
    gtLogo: { width: wp(30) },
    headerSub: { flexDirection: 'row' },
    headerItems: { width: wp(7), marginStart: wp(2) },
    onlineMembers: { backgroundColor: Helpers.Colors.light, height: hp('18'), width: wp('100'), }

});


