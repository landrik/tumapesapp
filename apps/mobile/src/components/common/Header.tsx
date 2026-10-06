import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { FONT_FAMILY } from '../../constants/typography';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightLabel?: string;
  onRightPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = true,
  rightLabel,
  onRightPress,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top, backgroundColor: theme.background }]}>
      <View style={styles.row}>
        <View style={styles.side}>
          {showBack && navigation.canGoBack() ? (
            <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button">
              <Ionicons name="chevron-back" size={26} color={theme.text} />
            </TouchableOpacity>
          ) : null}
        </View>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={[styles.side, styles.rightSide]}>
          {rightLabel ? (
            <TouchableOpacity onPress={onRightPress} accessibilityRole="button">
              <Text style={[styles.rightLabel, { color: theme.primary }]}>{rightLabel}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // paddingTop here is the fix: without it, the row below renders directly
  // under the status bar / notch / Dynamic Island on iPhone, since this
  // component doesn't sit inside a SafeAreaView anywhere it's used.
  wrapper: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
  },
  side: {
    width: 60,
    justifyContent: 'center',
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: FONT_FAMILY.semiBold,
  },
  rightLabel: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONT_FAMILY.semiBold,
  },
});
