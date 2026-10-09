import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Screens } from './screens';
import { stackScreenOptions, modalScreenOptions } from './stackOptions';
import { ROUTES } from '../constants/routes';

const Stack = createNativeStackNavigator();

export default function ChatStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.CHATS_LIST}
      screenOptions={stackScreenOptions}
    >
      <Stack.Screen name={ROUTES.CHATS_LIST} component={Screens.ChatsList} />
      <Stack.Screen name={ROUTES.CHAT} component={Screens.Chat} />
      <Stack.Screen name={ROUTES.NEW_CHAT} component={Screens.NewChat} />
      <Stack.Screen name={ROUTES.CHAT_INFO} component={Screens.ChatInfo} />
      <Stack.Screen name={ROUTES.CALL} component={Screens.Call} />
      <Stack.Screen name={ROUTES.CALL_HISTORY} component={Screens.CallHistory} />
      <Stack.Screen name={ROUTES.POST_DETAIL} component={Screens.PostDetail} />
      <Stack.Screen name={ROUTES.USER_PROFILE} component={Screens.UserProfile} />

      {/* Modal-style flows */}
      <Stack.Screen
        name={ROUTES.CONTACT_PICKER}
        component={Screens.ContactPicker}
        options={modalScreenOptions}
      />
      <Stack.Screen
        name={ROUTES.LOCATION_SHARE}
        component={Screens.LocationShare}
        options={modalScreenOptions}
      />
    </Stack.Navigator>
  );
}