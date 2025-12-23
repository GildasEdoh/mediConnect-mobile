import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  User as UserIcon,
  Package,
  Bell,
  LogOut,
  ChevronRight,
  Clock,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import {
  mockOrders,
  mockReminders,
  mockPharmacies,
  mockMedicines,
} from '@/data/mockData';
import { Order, MedicationReminder } from '@/types/database';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (!user) return;

    setLoading(true);
    setTimeout(() => {
      const userOrders = mockOrders
        .filter((o) => o.user_id === user.id)
        .slice(0, 5)
        .map((order) => ({
          ...order,
          pharmacy: mockPharmacies.find((p) => p.id === order.pharmacy_id),
        }));

      const userReminders = mockReminders
        .filter((r) => r.user_id === user.id && r.is_active)
        .map((reminder) => ({
          ...reminder,
          medicine: mockMedicines.find((m) => m.id === reminder.medicine_id),
        }));

      setOrders(userOrders as Order[]);
      setReminders(userReminders as MedicationReminder[]);
      setLoading(false);
    }, 300);
  };

  const handleSignOut = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/auth/login');
          } catch (error) {
            Alert.alert('Erreur', 'Impossible de se déconnecter');
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#00A86B';
      case 'delivering':
        return '#2196F3';
      case 'confirmed':
      case 'preparing':
        return '#F57C00';
      case 'cancelled':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'confirmed':
        return 'Confirmée';
      case 'preparing':
        return 'En préparation';
      case 'delivering':
        return 'En livraison';
      case 'delivered':
        return 'Livrée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.profileIconContainer}>
            <UserIcon size={40} color="#00A86B" strokeWidth={2} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile?.full_name || 'Utilisateur'}
            </Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Package size={24} color="#00A86B" strokeWidth={2} />
            <Text style={styles.statValue}>{orders.length}</Text>
            <Text style={styles.statLabel}>Commandes</Text>
          </View>
          <View style={styles.statCard}>
            <Bell size={24} color="#2196F3" strokeWidth={2} />
            <Text style={styles.statValue}>{reminders.length}</Text>
            <Text style={styles.statLabel}>Rappels actifs</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes commandes récentes</Text>
          {orders.length === 0 ? (
            <Text style={styles.emptyText}>Aucune commande pour le moment</Text>
          ) : (
            orders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderPharmacy}>
                    {order.pharmacy?.name}
                  </Text>
                  <View
                    style={[
                      styles.orderStatusBadge,
                      {
                        backgroundColor: `${getStatusColor(order.status)}20`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.orderStatusText,
                        { color: getStatusColor(order.status) },
                      ]}
                    >
                      {getStatusText(order.status)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.orderDate}>
                  {new Date(order.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={styles.orderAmount}>
                  {order.total_amount.toFixed(0)} FCFA
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rappels de médicaments</Text>
          {reminders.length === 0 ? (
            <Text style={styles.emptyText}>Aucun rappel actif</Text>
          ) : (
            reminders.map((reminder) => (
              <View key={reminder.id} style={styles.reminderCard}>
                <View style={styles.reminderIcon}>
                  <Clock size={20} color="#2196F3" strokeWidth={2} />
                </View>
                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderMedicine}>
                    {reminder.medicine?.name}
                  </Text>
                  <Text style={styles.reminderTime}>
                    {Array.isArray(reminder.reminder_times) &&
                    reminder.reminder_times.length > 0
                      ? `${reminder.reminder_times.length} fois par jour`
                      : 'Horaires non définis'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/profile/edit')}
          >
            <UserIcon size={20} color="#666666" strokeWidth={2} />
            <Text style={styles.menuItemText}>Modifier le profil</Text>
            <ChevronRight size={20} color="#cccccc" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/orders')}
          >
            <Package size={20} color="#666666" strokeWidth={2} />
            <Text style={styles.menuItemText}>Historique des commandes</Text>
            <ChevronRight size={20} color="#cccccc" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/reminders')}
          >
            <Bell size={20} color="#666666" strokeWidth={2} />
            <Text style={styles.menuItemText}>Gérer les rappels</Text>
            <ChevronRight size={20} color="#cccccc" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleSignOut}
          >
            <LogOut size={20} color="#F44336" strokeWidth={2} />
            <Text style={[styles.menuItemText, styles.logoutText]}>
              Déconnexion
            </Text>
          </TouchableOpacity>
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
  },
  content: {
    flex: 1,
    marginBottom: 60,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  profileIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E6F7F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666666',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666666',
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
  emptyText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderPharmacy: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  orderStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00A86B',
  },
  reminderCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderMedicine: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 13,
    color: '#666666',
  },
  menuItem: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    marginLeft: 12,
  },
  logoutItem: {
    marginTop: 8,
  },
  logoutText: {
    color: '#F44336',
    fontWeight: '600',
  },
});
