import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { FONT_FAMILY } from '../../constants/typography';

interface QuickSendWidgetProps {
  onPress: () => void;
}

// Note: a true linear gradient would normally use expo-linear-gradient, but
// that's not in this project's dependencies. Using a solid, theme-driven
// brand-color card instead rather than adding a new native dependency
// unprompted — this also means the widget automatically follows whichever
// accent color the user picks in Appearance settings.
export const QuickSendWidget: React.FC<QuickSendWidgetProps> = ({ onPress }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.primary }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: theme.white }]}>Send money</Text>
        <Text style={[styles.subtitle, { color: theme.primaryLight }]}>
          Fast, low-fee transfers worldwide
        </Text>
      </View>
      <View style={[styles.iconCircle, { backgroundColor: theme.white }]}>
        <Ionicons name="arrow-forward" size={22} color={theme.primary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
