import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { Screen } from '../../components/common/Screen';
import { Button } from '../../components/common/Button';
import { submitKyc } from '../../api/kyc';
import { getApiErrorMessage } from '../../api/client';
import { KycDocumentType } from '../../types/models';

interface KycFlowScreenProps {
  onComplete: () => void;
}

type Step = 'documentType' | 'front' | 'back' | 'selfie' | 'review' | 'done';

const DOCUMENT_TYPES: { value: KycDocumentType; label: string }[] = [
  { value: 'passport', label: 'Passport' },
  { value: 'driving_licence', label: "Driving licence" },
  { value: 'national_id', label: 'National ID card' },
];

const captureImage = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
    allowsEditing: false,
  });

  if (result.canceled || result.assets.length === 0) return null;
  return result.assets[0];
};

const assetToKycImage = (asset: ImagePicker.ImagePickerAsset, name: string) => ({
  uri: asset.uri,
  name: `${name}.jpg`,
  type: asset.mimeType || 'image/jpeg',
});

export const KycFlowScreen: React.FC<KycFlowScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>('documentType');
  const [documentType, setDocumentType] = useState<KycDocumentType | null>(null);
  const [frontImage, setFrontImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [backImage, setBackImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [selfie, setSelfie] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectDocumentType = (type: KycDocumentType) => {
    setDocumentType(type);
    setStep('front');
  };

  const handleCapture = async (which: 'front' | 'back' | 'selfie') => {
    const asset = await captureImage();
    if (!asset) return;

    if (which === 'front') {
      setFrontImage(asset);
      setStep('back');
    } else if (which === 'back') {
      setBackImage(asset);
      setStep('selfie');
    } else {
      setSelfie(asset);
      setStep('review');
    }
  };

  const skipStep = (which: 'back' | 'selfie') => {
    if (which === 'back') setStep('selfie');
    else setStep('review');
  };

  const handleSubmit = async () => {
    if (!documentType || !frontImage) {
      setError('A document type and front image are required');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      await submitKyc({
        documentType,
        frontImage: assetToKycImage(frontImage, 'front'),
        backImage: backImage ? assetToKycImage(backImage, 'back') : undefined,
        selfie: selfie ? assetToKycImage(selfie, 'selfie') : undefined,
      });
      setStep('done');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Verify your identity</Text>
        <Text style={styles.subtitle}>
          We need to confirm who you are before you can send money. This only takes a minute.
        </Text>

        {step === 'documentType' && (
          <View style={styles.optionList}>
            {DOCUMENT_TYPES.map(opt => (
              <Button
                key={opt.value}
                label={opt.label}
                variant="outline"
                onPress={() => handleSelectDocumentType(opt.value)}
                style={styles.optionButton}
              />
            ))}
            <Button label="I'll do this later" variant="ghost" onPress={onComplete} />
          </View>
        )}

        {step === 'front' && (
          <CaptureStep
            title="Front of your document"
            description="Make sure all four corners are visible and text is readable."
            onCapture={() => handleCapture('front')}
          />
        )}

        {step === 'back' && (
          <CaptureStep
            title="Back of your document"
            description="Optional — skip if your document type has no back side."
            onCapture={() => handleCapture('back')}
            onSkip={() => skipStep('back')}
          />
        )}

        {step === 'selfie' && (
          <CaptureStep
            title="Take a selfie"
            description="Optional — helps us match your face to your document."
            onCapture={() => handleCapture('selfie')}
            onSkip={() => skipStep('selfie')}
          />
        )}

        {step === 'review' && (
          <View>
            <Text style={styles.reviewLabel}>Front of document</Text>
            {frontImage ? <Image source={{ uri: frontImage.uri }} style={styles.preview} /> : null}
            {backImage ? (
              <>
                <Text style={styles.reviewLabel}>Back of document</Text>
                <Image source={{ uri: backImage.uri }} style={styles.preview} />
              </>
            ) : null}
            {selfie ? (
              <>
                <Text style={styles.reviewLabel}>Selfie</Text>
                <Image source={{ uri: selfie.uri }} style={styles.preview} />
              </>
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button label="Submit for review" onPress={handleSubmit} loading={submitting} style={styles.submitButton} />
          </View>
        )}

        {step === 'done' && (
          <View style={styles.doneBlock}>
            <Ionicons name="checkmark-circle" size={56} color={colors.success} />
            <Text style={styles.doneTitle}>Documents submitted</Text>
            <Text style={styles.subtitle}>
              We'll review them shortly — usually within 24 hours.
            </Text>
            <Button label="Continue" onPress={onComplete} style={styles.submitButton} />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
};

const CaptureStep: React.FC<{
  title: string;
  description: string;
  onCapture: () => void;
  onSkip?: () => void;
}> = ({ title, description, onCapture, onSkip }) => (
  <View>
    <View style={styles.captureBox}>
      <Ionicons name="camera-outline" size={40} color={colors.textSecondary} />
    </View>
    <Text style={styles.captureTitle}>{title}</Text>
    <Text style={styles.subtitle}>{description}</Text>
    <Button label="Open camera" onPress={onCapture} style={styles.optionButton} />
    {onSkip ? <Button label="Skip" variant="ghost" onPress={onSkip} /> : null}
  </View>
);

const styles = StyleSheet.create({
  content: { padding: 24, paddingTop: 24 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 20 },
  optionList: { gap: 12 },
  optionButton: { marginBottom: 8 },
  captureBox: {
    height: 180,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  captureTitle: { fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 4 },
  reviewLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6, marginTop: 12 },
  preview: { width: '100%', height: 160, borderRadius: 12, backgroundColor: colors.surface },
  error: { color: colors.error, fontSize: 13, marginTop: 12 },
  submitButton: { marginTop: 20 },
  doneBlock: { alignItems: 'center', paddingTop: 40 },
  doneTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 16, marginBottom: 8 },
});
