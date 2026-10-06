import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';

type Props = NativeStackScreenProps<ProfileStackParamList, 'HelpSupport'>;

const FAQS = [
  {
    question: 'How long does a transfer take?',
    answer:
      'Delivery time depends on the corridor and delivery method. Mobile money is often within minutes; bank transfers can take up to a few hours.',
  },
  {
    question: 'Can I cancel a transfer?',
    answer:
      'Only transfers still in the "pending" state can be cancelled. Once confirmed and processing, a transfer can no longer be cancelled from the app.',
  },
  {
    question: 'Why do I need to verify my identity?',
    answer:
      'Identity verification is a regulatory requirement for money transfer services. You only need to do it once.',
  },
  {
    question: 'What fees will I pay?',
    answer:
      'Each corridor has a fixed fee shown before you confirm. Tap "View full fee breakdown" on the review screen to see the itemised total.',
  },
];

export const HelpSupportScreen: React.FC<Props> = () => {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <Header title="Help & support" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Frequently asked</Text>

        {FAQS.map((faq, i) => (
          <View key={faq.question} style={styles.faqItem}>
            <TouchableOpacity
              style={styles.faqHeader}
              onPress={() => setExpanded(expanded === i ? null : i)}
            >
              <Text style={styles.question}>{faq.question}</Text>
              <Ionicons
                name={expanded === i ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            {expanded === i ? <Text style={styles.answer}>{faq.answer}</Text> : null}
          </View>
        ))}

        <Text style={styles.sectionTitle}>Get in touch</Text>

        <TouchableOpacity
          style={styles.contactRow}
          onPress={() => Linking.openURL('mailto:support@example.com')}
        >
          <Ionicons name="mail-outline" size={20} color={colors.primary} />
          <Text style={styles.contactLabel}>Email support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('tel:+448001234567')}>
          <Ionicons name="call-outline" size={20} color={colors.primary} />
          <Text style={styles.contactLabel}>Call us</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 16, marginBottom: 8 },
  faqItem: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 14 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  question: { flex: 1, fontSize: 14, fontWeight: '500', color: colors.text },
  answer: { fontSize: 13, color: colors.textSecondary, marginTop: 8, lineHeight: 19 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  contactLabel: { fontSize: 15, color: colors.text },
});
