import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Platform, Image, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as Helpers from '../assets/Exporter';
import { Icon } from 'react-native-elements';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import { useSelector } from 'react-redux';

import Contacts from '../screens/tabs/Contacts';
import Archives from '../screens/tabs/Archives';
import Visitors from '../screens/tabs/Visitors';
import Team from '../screens/tabs/Team';
import io from 'socket.io-client';


import CustomProfile from '../screens/tabs/CustomProfile';
import Chat from '../screens/Chat';



const Tab = createBottomTabNavigator();

const BottomTabs = ({ navigation, route }) => {
console.log("BottomTabs",navigation,route)



    const userImage = useSelector(state => state.AuthReducer.users.image)


    const CustomButton = ({ children, onPress }) => (
        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', right: hp(2) }} onPress={onPress}>
            <Image source={Helpers.Images.profileLogo} resizeMode="contain" style={{ width: hp(5), height: hp(5), borderRadius: 100, }} />
        </TouchableOpacity>
    );

    return (

        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <Tab.Navigator



                screenOptions={({ route }) => ({
                    tabBarShowLabel: false,

                    // tabBarLabel: ({ focused }) => (
                    //     <Text style={[focused ? styles.focusedTabText : styles.unfocusedTabText]}>{route.name}</Text>
                    // ),

                    tabBarStyle: [styles.tabBar, { paddingHorizontal:wp('3.2'), borderBottomRightRadius: wp('8'), borderBottomLeftRadius: wp('8'), padding: wp('1'), marginRight: wp('6'), marginLeft: wp('6') }],
                    headerShown: false,
                })}
                screenListeners={({ navigation }) => ({
                    tabLongPress: (e) => {
                        navigation.jumpTo(e.target.split('-')[0]);
                        console
                            .log("tabs", e)
                    },
                })}
                >

                <Tab.Screen name="Contacts" component={Contacts}
                    options={{
                        tabBarLabel: 'Contacts',
                        tabBarIcon: ({ focused, color, size }) => (
                            <View style={focused ? { alignItems: 'center', backgroundColor: 'rgba(50, 199, 136, 0.2)', borderRadius: wp('4'), padding: wp('2.5'), flexDirection: 'row' } : { alignItems: 'center', justifyContent: 'center', top: wp('0') }}>
                                <Icon name="contacts" type="antdesign" color={focused ? Helpers.Colors.primary : '#232323'} size={18} />

                                {focused &&
                                    <Text style={{ fontSize: wp('3.2'), marginStart: wp('2'), color: Helpers.Colors.primary }}>Contacts</Text>}
                                {/* style={[focused ? styles.focusedTabText : styles.unfocusedTabText]} */}
                            </View>
                        ),
                    }} />

                < Tab.Screen name="Archives" component={Archives}
                    options={{
                        tabBarLabel: 'Archives',
                        tabBarIcon: ({ focused, color, size }) => (
                            <View style={focused ? { alignItems: 'center', backgroundColor: 'rgba(50, 199, 136, 0.2)', borderRadius: wp('4'), padding: wp('2.5'), flexDirection: 'row' } : { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', top: wp('0') }}>
                                <Icon name="archive" type="feather" color={focused ? Helpers.Colors.primary : '#232323'} size={18} />

                                {focused &&
                                    <Text style={{ fontSize: wp('3.2'), marginStart: wp('2'), color: Helpers.Colors.primary }}>Archives</Text>}
                                {/* style={[focused ? styles.focusedTabText : styles.unfocusedTabText]} */}
                            </View>
                        ),
                    }} />

                <Tab.Screen name="Transfered Chats" component={Team}
                    options={{
                        tabBarLabel: 'Transfered Chats',
                        tabBarIcon: ({ focused, color, size }) => (
                            <View style={focused ? { alignItems: 'center', backgroundColor: 'rgba(50, 199, 136, 0.2)', borderRadius: wp('4'), padding: wp('2.5'), flexDirection: 'row' } : { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', top: wp('0') }}>
                                <Icon name="team" type="antdesign" color={focused ? Helpers.Colors.primary : '#232323'} size={18} />


                                {focused &&
                                    <Text style={{ fontSize: wp('3.2'), marginStart: wp('1'), color: Helpers.Colors.primary }}>Transfer</Text>}
                                {/* style={[focused ? styles.focusedTabText : styles.unfocusedTabText]} */}
                            </View>
                        ),
                    }} />

                <Tab.Screen name="Profile" component={CustomProfile}
                    options={{
                        tabBarLabel: 'Profile',
                        tabBarIcon: ({ focused, color, size }) => (
                            <View style={focused ? { alignItems: 'center', backgroundColor: 'rgba(50, 199, 136, 0.2)', borderRadius: wp('4'), padding: wp('2.5'), flexDirection: 'row' } : { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', top: wp('0') }}>
                                <Icon name="person-outline" type="ionicon" color={focused ? Helpers.Colors.primary : '#232323'} size={18} />


                                {focused &&
                                    <Text style={{ fontSize: wp('3.2'), marginStart: wp('1'), color: Helpers.Colors.primary }}>Profile</Text>}
                                {/* style={[focused ? styles.focusedTabText : styles.unfocusedTabText]} */}
                            </View>
                        ),
                    }} />
            </Tab.Navigator>
        </View>
    );


};
export default BottomTabs;

const styles = StyleSheet.create({
    //Helpers.Colors.inputFieldBg
    tabBar: { shadowColor: '#fff', shadowOpacity: wp('0.26'), shadowOffset: { width: 1, height: 1 }, elevation: wp('1'), height: wp('15'), backgroundColor: Helpers.Colors.light, borderTopWidth: 1, borderTopColor: Helpers.Colors.inputFieldBg },
    // shadowColor: '#cecece', shadowOpacity: wp('0.26'), shadowOffset: { width: 1, height: 1 }, elevation: wp('1'),
    focusedTabText: { color: Helpers.Colors.primary, fontSize: 10, width: wp('20'), textAlign: 'center' },
    unfocusedTabText: { color: Helpers.Colors.dark, fontSize: 10, width: wp('20'), textAlign: 'center' }

});
