import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ShoppingCart, MapPin, Phone } from 'lucide-react-native';
import {
  mockPharmacies,
  mockMedicines,
  mockInventory,
  addOrder,
  addOrderItem,
} from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Medicine, Pharmacy, PharmacyInventory } from '@/types/database';

export default function OrderScreen() {
  const { pharmacyId, medicineId } = useLocalSearchParams();
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [inventoryItem, setInventoryItem] = useState<PharmacyInventory | null>(
    null
  );
  const [quantity, setQuantity] = useState('1');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadOrderData();
  }, []);

  useEffect(() => {
    if (profile) {
      setDeliveryAddress(profile.address || '');
      setDeliveryPhone(profile.phone || '');
    }
  }, [profile]);

  const loadOrderData = async () => {
    setLoading(true);
    setTimeout(() => {
      const foundPharmacy = mockPharmacies.find((p) => p.id === pharmacyId);
      const foundMedicine = mockMedicines.find((m) => m.id === medicineId);
      const foundInventory = mockInventory.find(
        (inv) =>
          inv.pharmacy_id === pharmacyId && inv.medicine_id === medicineId
      );

      if (foundPharmacy) setPharmacy(foundPharmacy);
      if (foundMedicine) setMedicine(foundMedicine);
      if (foundInventory) setInventoryItem(foundInventory);

      setLoading(false);
    }, 300);
  };

  const calculateTotal = () => {
    if (!inventoryItem) return 0;
    const qty = parseInt(quantity) || 1;
    return inventoryItem.price * qty;
  };

  const handleSubmitOrder = async () => {
    if (!deliveryAddress || !deliveryPhone) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs requis');
      return;
    }

    if (!inventoryItem || !medicine || !pharmacy) {
      Alert.alert('Erreur', 'Données manquantes');
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      Alert.alert('Erreur', 'Quantité invalide');
      return;
    }

    if (qty > inventoryItem.quantity) {
      Alert.alert('Erreur', 'Stock insuffisant');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const totalAmount = calculateTotal();
      const orderId = `o${Date.now()}`;

      const order = {
        id: orderId,
        user_id: user!.id,
        pharmacy_id: pharmacy.id,
        total_amount: totalAmount,
        delivery_address: deliveryAddress,
        delivery_phone: deliveryPhone,
        notes: notes || undefined,
        status: 'pending' as const,
        payment_status: 'pending' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      addOrder(order);

      const orderItem = {
        id: `oi${Date.now()}`,
        order_id: orderId,
        medicine_id: medicine.id,
        quantity: qty,
        unit_price: inventoryItem.price,
        subtotal: totalAmount,
      };

      addOrderItem(orderItem);

      Alert.alert(
        'Commande envoyée',
        'Votre commande a été envoyée à la pharmacie. Vous recevrez une confirmation prochainement.',
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Médicament</Text>
          <View style={styles.medicineCard}>
            <Text style={styles.medicineName}>{medicine?.name}</Text>
            <Text style={styles.medicineDetails}>
              {medicine?.form} - {medicine?.dosage}
            </Text>
            <Text style={styles.medicinePrice}>
              {inventoryItem?.price.toFixed(0)} FCFA / unité
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pharmacie</Text>
          <View style={styles.pharmacyCard}>
            <View style={styles.pharmacyRow}>
              <MapPin size={20} color="#666666" strokeWidth={2} />
              <View style={styles.pharmacyInfo}>
                <Text style={styles.pharmacyName}>{pharmacy?.name}</Text>
                <Text style={styles.pharmacyAddress}>{pharmacy?.address}</Text>
              </View>
            </View>
            <View style={styles.pharmacyRow}>
              <Phone size={20} color="#666666" strokeWidth={2} />
              <Text style={styles.pharmacyPhone}>{pharmacy?.phone}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantité</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => {
                const qty = parseInt(quantity) || 1;
                if (qty > 1) setQuantity((qty - 1).toString());
              }}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
            />
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => {
                const qty = parseInt(quantity) || 1;
                if (inventoryItem && qty < inventoryItem.quantity) {
                  setQuantity((qty + 1).toString());
                }
              }}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.stockInfo}>
            Stock disponible: {inventoryItem?.quantity} unités
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de livraison</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Adresse de livraison *</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrez votre adresse complète"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Téléphone *</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre numéro de téléphone"
              value={deliveryPhone}
              onChangeText={setDeliveryPhone}
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Notes (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Instructions spéciales..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total à payer</Text>
          <Text style={styles.totalAmount}>
            {calculateTotal().toFixed(0)} FCFA
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmitOrder}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <ShoppingCart size={20} color="#ffffff" strokeWidth={2} />
              <Text style={styles.submitButtonText}>Confirmer la commande</Text>
            </>
          )}
        </TouchableOpacity>
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
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  medicineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  medicineName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  medicineDetails: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  medicinePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00A86B',
  },
  pharmacyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pharmacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pharmacyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  pharmacyAddress: {
    fontSize: 14,
    color: '#666666',
  },
  pharmacyPhone: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00A86B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  quantityInput: {
    width: 80,
    height: 48,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginHorizontal: 16,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  stockInfo: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  totalSection: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00A86B',
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
