import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Screens } from './screens';
import { stackScreenOptions, modalScreenOptions } from './stackOptions';
import { ROUTES } from '../constants/routes';

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator initialRouteName={ROUTES.HOME} screenOptions={stackScreenOptions}>
      <Stack.Screen name={ROUTES.HOME} component={Screens.Home} />
      <Stack.Screen name={ROUTES.POST_DETAIL} component={Screens.PostDetail} />
      <Stack.Screen name={ROUTES.USER_PROFILE} component={Screens.UserProfile} />
      <Stack.Screen name={ROUTES.HASHTAG} component={Screens.Hashtag} />
      <Stack.Screen name={ROUTES.EXPLORE} component={Screens.Explore} />
      <Stack.Screen name={ROUTES.SEARCH} component={Screens.Search} />
      <Stack.Screen name={ROUTES.NOTIFICATIONS} component={Screens.Notifications} />
      <Stack.Screen name={ROUTES.CREATE_POST} component={Screens.CreatePost} options={modalScreenOptions} />
      <Stack.Screen name={ROUTES.CREATE_STORY} component={Screens.CreateStory} options={modalScreenOptions} />
      <Stack.Screen name={ROUTES.VIBES} component={Screens.Vibes} />
      <Stack.Screen name={ROUTES.CREATE_VIBE} component={Screens.CreateVibe} options={modalScreenOptions} />

      <Stack.Screen name={ROUTES.CREATE_GROUP} component={Screens.CreateGroup} options={modalScreenOptions} />
      <Stack.Screen name={ROUTES.GROUP_INFO} component={Screens.GroupInfo} />
      <Stack.Screen name={ROUTES.COMMUNITIES} component={Screens.Communities} />
      <Stack.Screen name={ROUTES.COMMUNITY} component={Screens.Community} />
      <Stack.Screen name={ROUTES.CREATE_COMMUNITY} component={Screens.CreateCommunity} options={modalScreenOptions} />
      <Stack.Screen name={ROUTES.CHANNELS} component={Screens.Channels} />
      <Stack.Screen name={ROUTES.CHANNEL} component={Screens.Channel} />
      <Stack.Screen name={ROUTES.CREATE_CHANNEL} component={Screens.CreateChannel} options={modalScreenOptions} />
      <Stack.Screen name={ROUTES.CREATE_POLL} component={Screens.CreatePoll} options={modalScreenOptions} />

      <Stack.Screen name={ROUTES.NOVA_AI_CHAT} component={Screens.NovaAIChat} />
      <Stack.Screen name={ROUTES.CALL_HISTORY} component={Screens.CallHistory} />
    </Stack.Navigator>
  );
}