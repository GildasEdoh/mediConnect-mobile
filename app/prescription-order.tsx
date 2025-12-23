import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  ShoppingCart,
  FileText,
  CheckCircle,
  Package,
} from 'lucide-react-native';
import {
  mockPrescriptions,
  mockMedicines,
  mockInventory,
  mockPharmacies,
  addOrder,
  addOrderItem,
  updatePrescription,
} from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import {
  Prescription,
  Medicine,
  PharmacyInventory,
  Pharmacy,
} from '@/types/database';

interface MedicineWithAvailability extends Medicine {
  availability: PharmacyInventory[];
  selectedPharmacy?: string;
  quantity: number;
}

export default function PrescriptionOrderScreen() {
  const { prescriptionId } = useLocalSearchParams();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [medicines, setMedicines] = useState<MedicineWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadPrescriptionData();
  }, []);

  const loadPrescriptionData = async () => {
    setLoading(true);
    setTimeout(() => {
      const foundPrescription = mockPrescriptions.find(
        (p) => p.id === prescriptionId
      );

      if (foundPrescription) {
        setPrescription(foundPrescription);

        const medicineNames = extractMedicineNames(
          foundPrescription.ocr_text || ''
        );

        const medicinesWithAvailability: MedicineWithAvailability[] = [];

        for (const medicineName of medicineNames) {
          const foundMedicine = mockMedicines.find((m) =>
            m.name.toLowerCase().includes(medicineName.toLowerCase())
          );

          if (foundMedicine) {
            const inventory = mockInventory
              .filter(
                (inv) =>
                  inv.medicine_id === foundMedicine.id && inv.quantity > 0
              )
              .map((inv) => ({
                ...inv,
                pharmacy: mockPharmacies.find(
                  (p) => p.id === inv.pharmacy_id
                ),
              }));

            medicinesWithAvailability.push({
              ...foundMedicine,
              availability: inventory as PharmacyInventory[],
              quantity: 1,
            });
          }
        }

        setMedicines(medicinesWithAvailability);
      }

      setLoading(false);
    }, 300);
  };

  const extractMedicineNames = (ocrText: string): string[] => {
    if (!ocrText) return [];
    const lines = ocrText.split('\n');
    const medicineNames: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.length > 3 && !trimmedLine.toLowerCase().includes('dr.')) {
        medicineNames.push(trimmedLine);
      }
    }

    return medicineNames.slice(0, 5);
  };

  const updateMedicinePharmacy = (medicineId: string, pharmacyId: string) => {
    setMedicines((prev) =>
      prev.map((med) =>
        med.id === medicineId
          ? { ...med, selectedPharmacy: pharmacyId }
          : med
      )
    );
  };

  const updateMedicineQuantity = (medicineId: string, quantity: number) => {
    setMedicines((prev) =>
      prev.map((med) => (med.id === medicineId ? { ...med, quantity } : med))
    );
  };

  const handleSubmitOrders = async () => {
    const selectedMedicines = medicines.filter((m) => m.selectedPharmacy);

    if (selectedMedicines.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins une pharmacie');
      return;
    }

    if (!user?.email) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const ordersByPharmacy: { [key: string]: MedicineWithAvailability[] } =
        {};

      for (const medicine of selectedMedicines) {
        if (!medicine.selectedPharmacy) continue;

        if (!ordersByPharmacy[medicine.selectedPharmacy]) {
          ordersByPharmacy[medicine.selectedPharmacy] = [];
        }
        ordersByPharmacy[medicine.selectedPharmacy].push(medicine);
      }

      for (const [pharmacyId, pharmacyMedicines] of Object.entries(
        ordersByPharmacy
      )) {
        let totalAmount = 0;
        for (const medicine of pharmacyMedicines) {
          const inventory = medicine.availability.find(
            (inv) => inv.pharmacy_id === pharmacyId
          );
          if (inventory) {
            totalAmount += inventory.price * medicine.quantity;
          }
        }

        const orderId = `o${Date.now()}_${pharmacyId}`;
        const order = {
          id: orderId,
          user_id: user.id,
          pharmacy_id: pharmacyId,
          prescription_id: prescriptionId as string,
          total_amount: totalAmount,
          delivery_address: 'Adresse à compléter',
          delivery_phone: user.email,
          status: 'pending' as const,
          payment_status: 'pending' as const,
          notes: 'Commande depuis ordonnance',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        addOrder(order);

        for (const medicine of pharmacyMedicines) {
          const inventory = medicine.availability.find(
            (inv) => inv.pharmacy_id === pharmacyId
          );
          if (inventory) {
            const orderItem = {
              id: `oi${Date.now()}_${medicine.id}`,
              order_id: orderId,
              medicine_id: medicine.id,
              quantity: medicine.quantity,
              unit_price: inventory.price,
              subtotal: inventory.price * medicine.quantity,
            };

            addOrderItem(orderItem);
          }
        }
      }

      updatePrescription(prescriptionId as string, { status: 'processed' });

      Alert.alert(
        'Commandes envoyées',
        'Vos commandes ont été envoyées aux pharmacies. Vous recevrez une confirmation prochainement.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
      setSubmitting(false);
    }, 1000);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A86B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#ffffff" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commander</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.prescriptionCard}>
          <FileText size={24} color="#00A86B" strokeWidth={2} />
          <View style={styles.prescriptionInfo}>
            <Text style={styles.prescriptionTitle}>Ordonnance</Text>
            <Text style={styles.prescriptionDate}>
              {prescription?.created_at &&
                new Date(prescription.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Médicaments ({medicines.length})
          </Text>

          {medicines.length === 0 ? (
            <View style={styles.emptyState}>
              <Package size={48} color="#cccccc" strokeWidth={1.5} />
              <Text style={styles.emptyStateText}>
                Aucun médicament trouvé dans cette ordonnance
              </Text>
            </View>
          ) : (
            medicines.map((medicine) => (
              <View key={medicine.id} style={styles.medicineCard}>
                <View style={styles.medicineHeader}>
                  <Text style={styles.medicineName}>{medicine.name}</Text>
                  {medicine.requires_prescription && (
                    <View style={styles.prescriptionBadge}>
                      <Text style={styles.prescriptionText}>Ord.</Text>
                    </View>
                  )}
                </View>

                <View style={styles.quantityContainer}>
                  <Text style={styles.quantityLabel}>Quantité:</Text>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() =>
                        updateMedicineQuantity(
                          medicine.id,
                          Math.max(1, medicine.quantity - 1)
                        )
                      }
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityValue}>{medicine.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() =>
                        updateMedicineQuantity(medicine.id, medicine.quantity + 1)
                      }
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.pharmaciesLabel}>
                  Pharmacies disponibles ({medicine.availability.length})
                </Text>

                {medicine.availability.length === 0 ? (
                  <Text style={styles.noAvailability}>Non disponible</Text>
                ) : (
                  medicine.availability.map((inv) => (
                    <TouchableOpacity
                      key={inv.id}
                      style={[
                        styles.pharmacyOption,
                        medicine.selectedPharmacy === inv.pharmacy_id &&
                          styles.pharmacyOptionSelected,
                      ]}
                      onPress={() =>
                        updateMedicinePharmacy(medicine.id, inv.pharmacy_id)
                      }
                    >
                      <View style={styles.pharmacyOptionContent}>
                        <View style={styles.pharmacyOptionInfo}>
                          <Text style={styles.pharmacyOptionName}>
                            {inv.pharmacy?.name}
                          </Text>
                          <Text style={styles.pharmacyOptionStock}>
                            Stock: {inv.quantity}
                          </Text>
                        </View>
                        <Text style={styles.pharmacyOptionPrice}>
                          {inv.price.toFixed(0)} FCFA
                        </Text>
                      </View>
                      {medicine.selectedPharmacy === inv.pharmacy_id && (
                        <CheckCircle
                          size={20}
                          color="#00A86B"
                          strokeWidth={2}
                        />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </View>
            ))
          )}
        </View>

        {medicines.length > 0 && (
          <TouchableOpacity
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitOrders}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <ShoppingCart size={20} color="#ffffff" strokeWidth={2} />
                <Text style={styles.submitButtonText}>
                  Envoyer les commandes
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginBottom: 60,
  },
  prescriptionCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  prescriptionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  prescriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  prescriptionDate: {
    fontSize: 14,
    color: '#666666',
  },
  section: {
    padding: 20,
    paddingTop: 0,
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
    textAlign: 'center',
  },
  medicineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  prescriptionBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  prescriptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F57C00',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginRight: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00A86B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  pharmaciesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  noAvailability: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
  },
  pharmacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pharmacyOptionSelected: {
    borderColor: '#00A86B',
    backgroundColor: '#E6F7F0',
  },
  pharmacyOptionContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 8,
  },
  pharmacyOptionInfo: {
    flex: 1,
  },
  pharmacyOptionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  pharmacyOptionStock: {
    fontSize: 12,
    color: '#666666',
  },
  pharmacyOptionPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00A86B',
    marginRight: 8,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#00A86B',
    margin: 20,
    marginTop: 0,
    padding: 18,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
});
