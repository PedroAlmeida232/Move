import Ionicons from '@expo/vector-icons/Ionicons';
import { type ComponentProps } from 'react';
import { View } from 'react-native';

import { iconSize } from '../theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/** Ícone decorativo: o texto ao lado já diz tudo ao leitor de tela. */
export function Icon({
  name,
  color,
  size = iconSize.md,
  testID,
}: {
  name: IconName;
  color: string;
  size?: number;
  testID?: string;
}) {
  return (
    <View
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Ionicons name={name} color={color} size={size} />
    </View>
  );
}
