import React from 'react';
import StoryCreator from '../../components/stories/StoryCreator';

export default function CreateStoryScreen({ navigation }) {
  return (
    <StoryCreator
      onCancel={() => navigation.goBack()}
      onDone={() => navigation.goBack()}
    />
  );
}