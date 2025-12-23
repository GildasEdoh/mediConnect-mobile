import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Camera, Upload, FileText, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { mockPrescriptions, addPrescription } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Prescription, Medicine } from '@/types/database';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const cameraRef = useRef<CameraView>(null);
  const { user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    if (!user) return;

    const userPrescriptions = mockPrescriptions
      .filter((p) => p.user_id === user.id)
      .slice(0, 10);
    setPrescriptions(userPrescriptions);
  };

  const handleCameraOpen = async () => {
    if (!permission) {
      await requestPermission();
      return;
    }

    if (!permission.granted) {
      Alert.alert(
        'Permission requise',
        'L\'accès à la caméra est nécessaire pour scanner les ordonnances'
      );
      await requestPermission();
      return;
    }

    setShowCamera(true);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        if (photo) {
          setCapturedImage(photo.uri);
          setShowCamera(false);
          await processImage(photo.uri);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Erreur', 'Impossible de prendre la photo');
      }
    }
  };

  const processImage = async (imageUri: string) => {
    setProcessing(true);
    setTimeout(() => {
      const newPrescription: Prescription = {
        id: `pr${Date.now()}`,
        user_id: user!.id,
        image_url: imageUri,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      addPrescription(newPrescription);

      Alert.alert(
        'Succès',
        'Votre ordonnance a été enregistrée. L\'analyse sera disponible prochainement.',
        [{ text: 'OK', onPress: () => loadPrescriptions() }]
      );
      setCapturedImage(null);
      setProcessing(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return '#00A86B';
      case 'active':
        return '#2196F3';
      case 'completed':
        return '#9E9E9E';
      default:
        return '#F57C00';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'processed':
        return 'Traitée';
      case 'active':
        return 'Active';
      case 'completed':
        return 'Terminée';
      default:
        return status;
    }
  };

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} ref={cameraRef} facing="back">
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCamera(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.scanFrame} />

            <View style={styles.cameraFooter}>
              <Text style={styles.cameraInstruction}>
                Positionnez l'ordonnance dans le cadre
              </Text>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scanner</Text>
        <Text style={styles.headerSubtitle}>
          Numérisez vos ordonnances
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCameraOpen}
          >
            <Camera size={32} color="#ffffff" strokeWidth={2} />
            <Text style={styles.actionButtonText}>Prendre une photo</Text>
          </TouchableOpacity>
        </View>

        {processing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#00A86B" />
            <Text style={styles.processingText}>
              Traitement de l'ordonnance...
            </Text>
          </View>
        )}

        {capturedImage && (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: capturedImage }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </View>
        )}

        <View style={styles.infoCard}>
          <AlertCircle size={20} color="#00A86B" strokeWidth={2} />
          <Text style={styles.infoText}>
            Scannez votre ordonnance pour obtenir automatiquement la liste des
            médicaments prescrits et leurs disponibilités dans les pharmacies
            proches.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Mes ordonnances ({prescriptions.length})
          </Text>

          {prescriptions.length === 0 ? (
            <View style={styles.emptyState}>
              <FileText size={48} color="#cccccc" strokeWidth={1.5} />
              <Text style={styles.emptyStateText}>
                Aucune ordonnance enregistrée
              </Text>
            </View>
          ) : (
            prescriptions.map((prescription) => (
              <TouchableOpacity
                key={prescription.id}
                style={styles.prescriptionCard}
                onPress={() => {
                  if (prescription.status === 'pending' || prescription.status === 'processed') {
                    router.push({
                      pathname: '/prescription-order',
                      params: { prescriptionId: prescription.id },
                    });
                  }
                }}
              >
                <View style={styles.prescriptionHeader}>
                  <FileText size={24} color="#00A86B" strokeWidth={2} />
                  <View style={styles.prescriptionInfo}>
                    <Text style={styles.prescriptionDate}>
                      {new Date(prescription.created_at).toLocaleDateString(
                        'fr-FR',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }
                      )}
                    </Text>
                    {prescription.doctor_name && (
                      <Text style={styles.prescriptionDoctor}>
                        Dr. {prescription.doctor_name}
                      </Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: `${getStatusColor(prescription.status)}20`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(prescription.status) },
                      ]}
                    >
                      {getStatusText(prescription.status)}
                    </Text>
                  </View>
                </View>
                {(prescription.status === 'pending' || prescription.status === 'processed') && (
                  <Text style={styles.prescriptionAction}>
                    Appuyez pour commander →
                  </Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#00A86B',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    marginBottom: 60,
  },
  actionsContainer: {
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#00A86B',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 12,
  },
  processingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  previewContainer: {
    padding: 20,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E6F7F0',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#00A86B',
    lineHeight: 20,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999999',
  },
  prescriptionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  prescriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prescriptionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  prescriptionDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  prescriptionDoctor: {
    fontSize: 14,
    color: '#666666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  prescriptionAction: {
    fontSize: 13,
    color: '#00A86B',
    fontWeight: '600',
    marginTop: 8,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cameraHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#ffffff',
  },
  scanFrame: {
    flex: 1,
    margin: 40,
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  cameraFooter: {
    paddingBottom: 60,
    alignItems: 'center',
  },
  cameraInstruction: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#00A86B',
  },
});
