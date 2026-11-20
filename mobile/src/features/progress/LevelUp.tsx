import { Modal, StyleSheet, Text, View } from 'react-native';

import { fonts, useTheme } from '../../lib/theme';
import { PrimaryButton } from '../../lib/ui';

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
      <View style={styles.backdrop}>
        <View
          accessibilityViewIsModal
          style={[styles.card, { backgroundColor: theme.card }]}
        >
          <Text
            style={styles.emoji}
            accessibilityElementsHidden
            importantForAccessibility="no"
          >
            🎉
          </Text>
          <Text
            accessibilityRole="header"
            style={[styles.title, { color: theme.ink }]}
          >
            Nível novo!
          </Text>
          <Text style={[styles.text, { color: theme.muted }]}>
            Você chegou ao nível {level}.
          </Text>
          <PrimaryButton title="Continuar" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    padding: 24,
    gap: 12,
  },
  emoji: { fontSize: 44, textAlign: 'center' },
  title: {
    fontFamily: fonts.native,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  text: {
    fontFamily: fonts.native,
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 8,
  },
});
