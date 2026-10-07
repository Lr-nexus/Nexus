import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import Header from '../../components/common/Header';
import { Text } from 'react-native';
import PollComposer from '../../components/polls/PollComposer';

export default function CreatePollScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { contextType = 'group', contextId } = route.params || {};

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <Header
        title="New poll"
        leftIcon={<Text style={{ color: colors.text, fontSize: 24, lineHeight: 24 }}>‹</Text>}
        onLeftPress={() => navigation.goBack()}
      />
      <PollComposer
        contextType={contextType}
        contextId={contextId}
        onCancel={() => navigation.goBack()}
        onCreated={() => navigation.goBack()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 } });