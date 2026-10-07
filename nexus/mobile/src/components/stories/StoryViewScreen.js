import React from 'react';
import StoryViewer from '../../components/stories/StoryViewer';

export default function StoryViewScreen({ route, navigation }) {
  const { stories = [], initialIndex = 0 } = route.params || {};
  return (
    <StoryViewer
      stories={stories}
      initialIndex={initialIndex}
      onClose={() => navigation.goBack()}
    />
  );
}