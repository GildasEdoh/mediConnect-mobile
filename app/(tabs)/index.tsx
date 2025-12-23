import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, MapPin, ShoppingCart, ScanLine } from 'lucide-react-native';
import {
  mockMedicines,
  mockInventory,
  mockPharmacies,
} from '@/data/mockData';
import { Medicine, PharmacyInventory } from '@/types/database';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
  const [pharmacyInventory, setPharmacyInventory] = useState<
    PharmacyInventory[]
  >([]);
  const router = useRouter();

  const searchMedicines = async (query: string) => {
    if (!query.trim()) {
      setMedicines([]);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const filtered = mockMedicines.filter((med) =>
        med.name.toLowerCase().includes(query.toLowerCase())
      );
      setMedicines(filtered);
      setLoading(false);
    }, 300);
  };

  const loadPharmaciesWithMedicine = async (medicineId: string) => {
    setLoading(true);
    setTimeout(() => {
      const inventory = mockInventory
        .filter((inv) => inv.medicine_id === medicineId && inv.quantity > 0)
        .map((inv) => ({
          ...inv,
          pharmacy: mockPharmacies.find((p) => p.id === inv.pharmacy_id),
          medicine: mockMedicines.find((m) => m.id === inv.medicine_id),
        }));
      setPharmacyInventory(inventory as PharmacyInventory[]);
      setLoading(false);
    }, 300);
  };

  const handleMedicineSelect = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    loadPharmaciesWithMedicine(medicine.id);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchMedicines(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MediConnect</Text>
        <Text style={styles.headerSubtitle}>
          Trouvez vos médicaments facilement
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#666666" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un médicament..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00A86B" />
          </View>
        )}

        {!selectedMedicine && medicines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Résultats de recherche</Text>
            {medicines.map((medicine) => (
              <TouchableOpacity
                key={medicine.id}
                style={styles.medicineCard}
                onPress={() => handleMedicineSelect(medicine)}
              >
                <View style={styles.medicineInfo}>
                  <Text style={styles.medicineName}>{medicine.name}</Text>
                  {medicine.generic_name && (
                    <Text style={styles.medicineGeneric}>
                      {medicine.generic_name}
                    </Text>
                  )}
                  <Text style={styles.medicineForm}>
                    {medicine.form} - {medicine.dosage}
                  </Text>
                </View>
                {medicine.requires_prescription && (
                  <View style={styles.prescriptionBadge}>
                    <Text style={styles.prescriptionText}>Sur ord.</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedMedicine && (
          <>
            <View style={styles.selectedMedicineHeader}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedMedicine(null);
                  setPharmacyInventory([]);
                }}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>← Retour</Text>
              </TouchableOpacity>
              <Text style={styles.selectedMedicineName}>
                {selectedMedicine.name}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Pharmacies disponibles ({pharmacyInventory.length})
              </Text>
              {pharmacyInventory.map((item) => (
                <View key={item.id} style={styles.pharmacyCard}>
                  <View style={styles.pharmacyHeader}>
                    <Text style={styles.pharmacyName}>
                      {item.pharmacy?.name}
                    </Text>
                    <Text style={styles.pharmacyPrice}>
                      {item.price.toFixed(0)} FCFA
                    </Text>
                  </View>
                  <Text style={styles.pharmacyAddress}>
                    {item.pharmacy?.address}
                  </Text>
                  <View style={styles.pharmacyFooter}>
                    <View style={styles.stockBadge}>
                      <Text style={styles.stockText}>
                        Stock: {item.quantity}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.orderButton}
                      onPress={() =>
                        router.push({
                          pathname: '/order',
                          params: {
                            pharmacyId: item.pharmacy_id,
                            medicineId: item.medicine_id,
                          },
                        })
                      }
                    >
                      <ShoppingCart size={16} color="#ffffff" strokeWidth={2} />
                      <Text style={styles.orderButtonText}>Commander</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {searchQuery && !loading && medicines.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Aucun médicament trouvé
            </Text>
          </View>
        )}

        {!searchQuery && (
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Actions rapides</Text>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/scanner')}
            >
              <View style={styles.actionIconContainer}>
                <ScanLine size={32} color="#00A86B" strokeWidth={2} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Scanner une ordonnance</Text>
                <Text style={styles.actionDescription}>
                  Analysez automatiquement vos prescriptions
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/pharmacies')}
            >
              <View style={styles.actionIconContainer}>
                <MapPin size={32} color="#00A86B" strokeWidth={2} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Pharmacies proches</Text>
                <Text style={styles.actionDescription}>
                  Trouvez les pharmacies autour de vous
                </Text>
              </View>
            </TouchableOpacity>
          </View>
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333333',
  },
  content: {
    flex: 1,
    marginBottom: 60,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
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
  medicineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  medicineGeneric: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  medicineForm: {
    fontSize: 13,
    color: '#999999',
  },
  prescriptionBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  prescriptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F57C00',
  },
  selectedMedicineHeader: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#00A86B',
    fontWeight: '600',
  },
  selectedMedicineName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  pharmacyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pharmacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  pharmacyPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00A86B',
  },
  pharmacyAddress: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  pharmacyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockBadge: {
    backgroundColor: '#E6F7F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  stockText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00A86B',
  },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A86B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  orderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 6,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999999',
  },
  quickActions: {
    padding: 20,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E6F7F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666666',
  },
});
