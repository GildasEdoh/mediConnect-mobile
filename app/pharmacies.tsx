import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  MapPin,
  Phone,
  Navigation,
  Clock,
  ChevronLeft,
} from 'lucide-react-native';
import { mockPharmacies } from '@/data/mockData';
import { Pharmacy } from '@/types/database';

export default function PharmaciesScreen() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadPharmacies();
  }, []);

  const loadPharmacies = async () => {
    setLoading(true);
    setTimeout(() => {
      const activePharmacies = mockPharmacies
        .filter((p) => p.is_active)
        .sort((a, b) => a.name.localeCompare(b.name));
      setPharmacies(activePharmacies);
      setLoading(false);
    }, 300);
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const openDirections = (pharmacy: Pharmacy) => {
    const url = Platform.select({
      ios: `maps://app?daddr=${pharmacy.latitude},${pharmacy.longitude}`,
      android: `google.navigation:q=${pharmacy.latitude},${pharmacy.longitude}`,
      web: `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const callPharmacy = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#ffffff" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pharmacies</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A86B" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {pharmacies.length} pharmacie{pharmacies.length > 1 ? 's' : ''}{' '}
              trouvée{pharmacies.length > 1 ? 's' : ''}
            </Text>

            {pharmacies.map((pharmacy) => (
              <View key={pharmacy.id} style={styles.pharmacyCard}>
                <View style={styles.pharmacyHeader}>
                  <View style={styles.pharmacyIconContainer}>
                    <MapPin size={24} color="#00A86B" strokeWidth={2} />
                  </View>
                  <View style={styles.pharmacyInfo}>
                    <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
                    <Text style={styles.pharmacyAddress}>
                      {pharmacy.address}
                    </Text>
                  </View>
                </View>

                <View style={styles.pharmacyActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => callPharmacy(pharmacy.phone)}
                  >
                    <Phone size={18} color="#00A86B" strokeWidth={2} />
                    <Text style={styles.actionButtonText}>Appeler</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openDirections(pharmacy)}
                  >
                    <Navigation size={18} color="#00A86B" strokeWidth={2} />
                    <Text style={styles.actionButtonText}>Itinéraire</Text>
                  </TouchableOpacity>
                </View>

                {pharmacy.opening_hours &&
                  Object.keys(pharmacy.opening_hours).length > 0 && (
                    <View style={styles.hoursContainer}>
                      <Clock size={16} color="#666666" strokeWidth={2} />
                      <Text style={styles.hoursText}>
                        Consultez les horaires
                      </Text>
                    </View>
                  )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
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
    marginBottom: 16,
  },
  pharmacyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pharmacyHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  pharmacyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6F7F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pharmacyInfo: {
    flex: 1,
  },
  pharmacyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  pharmacyAddress: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  pharmacyActions: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F7F0',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00A86B',
    marginLeft: 6,
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  hoursText: {
    fontSize: 13,
    color: '#666666',
    marginLeft: 6,
  },
});
