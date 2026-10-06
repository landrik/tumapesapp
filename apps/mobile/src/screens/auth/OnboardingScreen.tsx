import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Button } from '../../components/common/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

const SLIDES = [
  { title: 'Send money globally', body: 'Transfer to over a dozen countries in minutes.' },
  { title: 'Great exchange rates', body: 'Transparent fees, live rates, no surprises.' },
  { title: 'Fast & secure', body: 'Bank-grade security with biometric login.' },
];

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <FlatList
        data={SLIDES}
        keyExtractor={(item) => item.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(newIndex);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          label={isLast ? 'Get started' : 'Next'}
          onPress={() => navigation.navigate('Login')}
        />
        <Button
          label="I already have an account"
          variant="ghost"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 8,
  },
});
