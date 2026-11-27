import { Modal, StyleSheet, Text, View } from 'react-native';

import { fonts, iconSize, radius, space, type, useTheme } from '../../lib/theme';
import { Button } from '../../lib/ui/Button';
import { Icon } from '../../lib/ui/Icon';

/** Celebração simples de nível novo (sem animação pesada). */
export function LevelUp({
  level,
  onClose,
}: {
  level: string | null;
  onClose: () => void;
}) {
  const theme = useTheme();
  return (
    <Modal
      visible={level !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { backgroundColor: theme.scrim }]}>
        <View
          accessibilityViewIsModal
          style={[styles.card, { backgroundColor: theme.card }]}
        >
          <View style={[styles.badge, { backgroundColor: theme.tint }]}>
            <Icon name="trophy" color={theme.blue} size={iconSize.lg} />
          </View>
          <Text
            accessibilityRole="header"
            style={[styles.title, { color: theme.ink }]}
          >
            Nível novo!
          </Text>
          <Text style={[styles.text, { color: theme.muted }]}>
            Você chegou ao nível {level}.
          </Text>
          <Button title="Continuar" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.lg,
    padding: space.xl,
    gap: space.md,
    alignItems: 'stretch',
  },
  badge: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.native, ...type.title, textAlign: 'center' },
  text: { fontFamily: fonts.native, ...type.body, textAlign: 'center' },
});
