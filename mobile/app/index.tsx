import { StyleSheet, Text, View } from 'react-native';

import { fonts, useTheme } from '../src/lib/theme';

export default function Home() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.ink }]}>Move</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.native, fontSize: 34, fontWeight: '700' },
});
