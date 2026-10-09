import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const placeholderStyles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#080B18', padding: 24 },
  txt: { color: '#F59E0B', fontWeight: '800', fontSize: 16, textAlign: 'center' },
  sub: { color: '#64748B', marginTop: 8, fontSize: 12, textAlign: 'center' },
});

function Missing(name) {
  return function MissingScreen() {
    return (
      <View style={placeholderStyles.wrap}>
        <Text style={placeholderStyles.txt}>⚠️ {name}</Text>
        <Text style={placeholderStyles.sub}>This screen failed to load. Check the Metro log for details.</Text>
      </View>
    );
  };
}

function safe(name, loader) {
  try {
    const mod = loader();
    const Comp = mod && (mod.default || mod);
    if (typeof Comp === 'function') return Comp;
    console.warn(`[screens] "${name}" has no default export.`);
    return Missing(name);
  } catch (e) {
    console.warn(`[screens] "${name}" failed to load: ${e.message}`);
    return Missing(name);
  }
}

export const Screens = {
  // Auth
  Welcome: safe('Welcome', () => require('../screens/auth/WelcomeScreen')),
  Onboarding: safe('Onboarding', () => require('../screens/auth/OnboardingScreen')),
  Login: safe('Login', () => require('../screens/auth/LoginScreen')),
  Register: safe('Register', () => require('../screens/auth/RegisterScreen')),
  VerifyOtp: safe('VerifyOtp', () => require('../screens/auth/VerifyOtpScreen')),
  AccountRecovery: safe('AccountRecovery', () => require('../screens/auth/AccountRecoveryScreen')),
  ResetPassword: safe('ResetPassword', () => require('../screens/auth/ResetPasswordScreen')),
  LockScreen: safe('LockScreen', () => require('../screens/auth/LockScreen')),

  // Home
  Home: safe('Home', () => require('../screens/home/HomeScreen')),

  // Posts
  CreatePost: safe('CreatePost', () => require('../screens/posts/CreatePostScreen')),
  PostDetail: safe('PostDetail', () => require('../screens/posts/PostDetailScreen')),
  ImageEditor: safe('ImageEditor', () => require('../screens/posts/ImageEditorScreen')),

  // Stories
  CreateStory: safe('CreateStory', () => require('../screens/stories/CreateStoryScreen')),
  StoryView: safe('StoryView', () => require('../screens/stories/StoryViewScreen')),
  StoriesFeed: safe('StoriesFeed', () => require('../screens/stories/StoriesFeedScreen')),

  // Explore / Search
  Explore: safe('Explore', () => require('../screens/explore/ExploreScreen')),
  Search: safe('Search', () => require('../screens/explore/SearchScreen')),
  Hashtag: safe('Hashtag', () => require('../screens/explore/HashtagScreen')),

  // Vibes
  Vibes: safe('Vibes', () => require('../screens/vibes/VibesScreen')),
  CreateVibe: safe('CreateVibe', () => require('../screens/vibes/CreateVibeScreen')),

  // Chat
  ChatsList: safe('ChatsList', () => require('../screens/chat/ChatsListScreen')),
  Chat: safe('Chat', () => require('../screens/chat/ChatScreen')),
  NewChat: safe('NewChat', () => require('../screens/chat/NewChatScreen')),
  ChatInfo: safe('ChatInfo', () => require('../screens/chat/ChatInfoScreen')),
  ChatSearch: safe('ChatSearch', () => require('../screens/chat/ChatSearchScreen')),
  ChatLock: safe('ChatLock', () => require('../screens/chat/ChatLockScreen')),
  ContactPicker: safe('ContactPicker', () => require('../screens/chat/ContactPickerScreen')),
  LocationShare: safe('LocationShare', () => require('../screens/chat/LocationShareScreen')),

  // Groups / Communities / Channels
  CreateGroup: safe('CreateGroup', () => require('../screens/groups/CreateGroupScreen')),
  GroupInfo: safe('GroupInfo', () => require('../screens/groups/GroupInfoScreen')),
  AddMembers: safe('AddMembers', () => require('../screens/chat/AddMembersScreen')),
  Communities: safe('Communities', () => require('../screens/communities/CommunitiesListScreen')),
  Community: safe('Community', () => require('../screens/communities/CommunityScreen')),
  CreateCommunity: safe('CreateCommunity', () => require('../screens/communities/CreateCommunityScreen')),
  Channels: safe('Channels', () => require('../screens/channels/ChannelsListScreen')),
  Channel: safe('Channel', () => require('../screens/channels/ChannelScreen')),
  CreateChannel: safe('CreateChannel', () => require('../screens/channels/CreateChannelScreen')),
  CreatePoll: safe('CreatePoll', () => require('../screens/polls/CreatePollScreen')),

  // Profiles
  MyProfile: safe('MyProfile', () => require('../screens/profiles/MyProfileScreen')),
  UserProfile: safe('UserProfile', () => require('../screens/profiles/UserProfileScreen')),
  EditProfile: safe('EditProfile', () => require('../screens/profiles/EditProfileScreen')),
  Followers: safe('Followers', () => require('../screens/profiles/FollowersScreen')),
  Following: safe('Following', () => require('../screens/profiles/FollowingScreen')),

  // Settings
  Settings: safe('Settings', () => require('../screens/settings/SettingsScreen')),
  PrivacySettings: safe('PrivacySettings', () => require('../screens/settings/PrivacySettingsScreen')),
  NotificationSettings: safe('NotificationSettings', () => require('../screens/settings/NotificationSettingsScreen')),
  AppearanceSettings: safe('AppearanceSettings', () => require('../screens/settings/AppearanceSettingsScreen')),
  ChatSettings: safe('ChatSettings', () => require('../screens/settings/ChatSettingsScreen')),
  SecuritySettings: safe('SecuritySettings', () => require('../screens/settings/SecuritySettingsScreen')),
  AISettings: safe('AISettings', () => require('../screens/settings/AISettingsScreen')),
  LoginActivity: safe('LoginActivity', () => require('../screens/settings/LoginActivityScreen')),
  About: safe('About', () => require('../screens/settings/AboutScreen')),
  AppLock: safe('AppLock', () => require('../screens/settings/AppLockScreen')),

  // Rizz AI
  RizzHome: safe('RizzHome', () => require('../screens/rizz/RizzHomeScreen')),
  RizzChat: safe('RizzChat', () => require('../screens/rizz/RizzChatScreen')),
  RizzHistory: safe('RizzHistory', () => require('../screens/rizz/RizzHistoryScreen')),
  RizzSaved: safe('RizzSaved', () => require('../screens/rizz/RizzSavedScreen')),
  RizzSettings: safe('RizzSettings', () => require('../screens/rizz/RizzSettingsScreen')),
  RizzScreenshot: safe('RizzScreenshot', () => require('../screens/rizz/RizzScreenshotScreen')),

  // Nova AI
  NovaAIHome: safe('NovaAIHome', () => require('../screens/nova-ai/NovaAIHomeScreen')),
  NovaAIChat: safe('NovaAIChat', () => require('../screens/nova-ai/NovaAIChatScreen')),

  // Notifications / Calls
  Notifications: safe('Notifications', () => require('../screens/notifications/NotificationsScreen')),
  Call: safe('Call', () => require('../screens/calls/CallScreen')),
  IncomingCall: safe('IncomingCall', () => require('../screens/calls/IncomingCallScreen')),
  CallHistory: safe('CallHistory', () => require('../screens/calls/CallHistoryScreen')),

  // Admin
  AdminDashboard: safe('AdminDashboard', () => require('../screens/admin/AdminDashboardScreen')),
  AdminUsers: safe('AdminUsers', () => require('../screens/admin/AdminUsersScreen')),
  AdminReports: safe('AdminReports', () => require('../screens/admin/AdminReportsScreen')),
  AdminStats: safe('AdminStats', () => require('../screens/admin/AdminStatsScreen')),
};