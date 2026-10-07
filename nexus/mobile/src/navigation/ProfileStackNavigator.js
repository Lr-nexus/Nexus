import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Screens } from './screens';
import { stackScreenOptions } from './stackOptions';
import { ROUTES } from '../constants/routes';

const Stack = createNativeStackNavigator();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator initialRouteName={ROUTES.MY_PROFILE} screenOptions={stackScreenOptions}>
      <Stack.Screen name={ROUTES.MY_PROFILE} component={Screens.MyProfile} />
      <Stack.Screen name={ROUTES.USER_PROFILE} component={Screens.UserProfile} />
      <Stack.Screen name={ROUTES.EDIT_PROFILE} component={Screens.EditProfile} />
      <Stack.Screen name={ROUTES.FOLLOWERS} component={Screens.Followers} />
      <Stack.Screen name={ROUTES.FOLLOWING} component={Screens.Following} />
      <Stack.Screen name={ROUTES.POST_DETAIL} component={Screens.PostDetail} />
      <Stack.Screen name={ROUTES.SETTINGS} component={Screens.Settings} />
      <Stack.Screen name={ROUTES.PRIVACY_SETTINGS} component={Screens.PrivacySettings} />
      <Stack.Screen name={ROUTES.NOTIFICATION_SETTINGS} component={Screens.NotificationSettings} />
      <Stack.Screen name={ROUTES.APPEARANCE_SETTINGS} component={Screens.AppearanceSettings} />
      <Stack.Screen name={ROUTES.CHAT_SETTINGS} component={Screens.ChatSettings} />
      <Stack.Screen name={ROUTES.SECURITY_SETTINGS} component={Screens.SecuritySettings} />
      <Stack.Screen name={ROUTES.AI_SETTINGS} component={Screens.AISettings} />
      <Stack.Screen name={ROUTES.LOGIN_ACTIVITY} component={Screens.LoginActivity} />
      <Stack.Screen name={ROUTES.ABOUT} component={Screens.About} />
    </Stack.Navigator>
  );
}