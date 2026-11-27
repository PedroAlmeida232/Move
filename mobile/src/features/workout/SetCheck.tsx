import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

import { radius, touchTarget, useTheme } from '../../lib/theme';
import { Icon } from '../../lib/ui/Icon';

/** Caixa redonda da série: pulsa ao marcar e dá uma vibração leve. */
export function SetCheck({
  label,
  checked,
  disabled,
  onToggle,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const theme = useTheme();
  const [scale] = useState(() => new Animated.Value(1));

  function pulse() {
    scale.setValue(0.8);
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      hitSlop={4}
      onPress={() => {
        Haptics.selectionAsync();
        pulse();
        onToggle();
      }}
    >
      <Animated.View
        style={[
          styles.check,
          {
            transform: [{ scale }],
            borderColor: checked ? theme.blue : theme.sep,
            backgroundColor: checked ? theme.blue : 'transparent',
          },
        ]}
      >
        {checked ? <Icon name="checkmark" color={theme.onBlue} /> : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  check: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
