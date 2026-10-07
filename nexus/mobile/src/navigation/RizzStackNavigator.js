import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Screens } from './screens';
import { stackScreenOptions } from './stackOptions';
import { ROUTES } from '../constants/routes';

const Stack = createNativeStackNavigator();

export default function RizzStackNavigator() {
  return (
    <Stack.Navigator initialRouteName={ROUTES.RIZZ_HOME} screenOptions={stackScreenOptions}>
      <Stack.Screen name={ROUTES.RIZZ_HOME} component={Screens.RizzHome} />
      <Stack.Screen name={ROUTES.RIZZ_CHAT} component={Screens.RizzChat} />
      <Stack.Screen name={ROUTES.RIZZ_HISTORY} component={Screens.RizzHistory} />
      <Stack.Screen name={ROUTES.RIZZ_SAVED} component={Screens.RizzSaved} />
      <Stack.Screen name={ROUTES.RIZZ_SETTINGS} component={Screens.RizzSettings} />
      <Stack.Screen name={ROUTES.RIZZ_SCREENSHOT} component={Screens.RizzScreenshot} />
      <Stack.Screen name={ROUTES.POST_DETAIL} component={Screens.PostDetail} />
      <Stack.Screen name={ROUTES.USER_PROFILE} component={Screens.UserProfile} />
    </Stack.Navigator>
  );
}