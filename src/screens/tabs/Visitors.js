import React from 'react';
import { StyleSheet, View,Text } from 'react-native';

const Visitors = () => {
    return(
        <View style= {styles.container}>
            <Text>Visitors</Text>
        </View>
    );
};
export default Visitors;

const styles =  StyleSheet.create({
    container: { flex:1, justifyContent:'center',alignItems:'center' }
});