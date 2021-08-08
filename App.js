import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Board from './src/Screens/Board'
import FinalResult from './src/Screens/FinalResult'
const Stack = createStackNavigator();

export default function MyStack() {
  return (
    <NavigationContainer>
    <Stack.Navigator>
    <Stack.Screen name="Board" component={Board} options={{ headerShown:false }}/>
    <Stack.Screen name="FinalResult" component={FinalResult} />
     
    </Stack.Navigator>
    </NavigationContainer>
  );
}