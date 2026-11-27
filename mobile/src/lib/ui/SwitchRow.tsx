import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, radius, space, touchTarget, type, useTheme } from '../theme';
import { Icon, type IconName } from './Icon';

const TRACK = { width: 51, height: 31 };
const THUMB = 27;

/** Linha de lista com chave liga/desliga, no desenho da chave do iPhone. A linha toda é tocável. */
export function SwitchRow({
  icon,
  title,
  subtitle,
  value,
  disabled = false,
  onChange,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  value: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={title}
      accessibilityHint={subtitle}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onChange(!value)}
      style={styles.row}
    >
      {icon ? <Icon name={icon} color={theme.blue} /> : null}
      <View style={styles.texts}>
        <Text style={[styles.title, { color: theme.ink }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.support, { color: theme.muted }]}>{subtitle}</Text>
        ) : null}
      </View>
      <View
        style={[
          styles.track,
          {
            backgroundColor: value ? theme.sucesso : theme.fill,
            alignItems: value ? 'flex-end' : 'flex-start',
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <View style={[styles.thumb, { backgroundColor: theme.card }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  texts: { flex: 1, gap: space.xs / 2 },
  title: { fontFamily: fonts.native, ...type.body },
  support: { fontFamily: fonts.native, ...type.caption },
  track: {
    width: TRACK.width,
    height: TRACK.height,
    borderRadius: radius.full,
    padding: (TRACK.height - THUMB) / 2,
    justifyContent: 'center',
  },
  thumb: { width: THUMB, height: THUMB, borderRadius: radius.full },
});
