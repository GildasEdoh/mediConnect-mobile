import {
  Medicine,
  Pharmacy,
  PharmacyInventory,
  Prescription,
  Order,
  OrderItem,
  MedicationReminder,
  ChatConversation,
  ChatMessage,
  Profile,
} from '@/types/database';

export const mockMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracétamol',
    generic_name: 'Acétaminophène',
    description: 'Antalgique et antipyrétique',
    dosage: '500mg',
    form: 'Comprimé',
    manufacturer: 'PharmaCorp',
    requires_prescription: false,
    warnings: 'Ne pas dépasser 4g par jour',
    interactions: [],
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Doliprane',
    generic_name: 'Paracétamol',
    description: 'Traitement de la fièvre et de la douleur',
    dosage: '1000mg',
    form: 'Comprimé',
    manufacturer: 'Sanofi',
    requires_prescription: false,
    warnings: 'Ne pas associer avec d\'autres médicaments contenant du paracétamol',
    interactions: [],
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Amoxicilline',
    generic_name: 'Amoxicilline',
    description: 'Antibiotique',
    dosage: '500mg',
    form: 'Gélule',
    manufacturer: 'BioMed',
    requires_prescription: true,
    warnings: 'Traitement complet nécessaire',
    interactions: [],
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Ibuprofène',
    generic_name: 'Ibuprofène',
    description: 'Anti-inflammatoire non stéroïdien',
    dosage: '400mg',
    form: 'Comprimé',
    manufacturer: 'PharmaCorp',
    requires_prescription: false,
    warnings: 'Prendre au cours des repas',
    interactions: [],
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Aspirine',
    generic_name: 'Acide acétylsalicylique',
    description: 'Antalgique, antipyrétique et antiagrégant plaquettaire',
    dosage: '100mg',
    form: 'Comprimé',
    manufacturer: 'Bayer',
    requires_prescription: false,
    warnings: 'Ne pas utiliser chez l\'enfant sans avis médical',
    interactions: [],
    created_at: new Date().toISOString(),
  },
];

export const mockPharmacies: Pharmacy[] = [
  {
    id: 'p1',
    name: 'Pharmacie Centrale',
    address: 'Avenue de l\'Indépendance, Dakar',
    phone: '+221 33 821 12 34',
    latitude: 14.6937,
    longitude: -17.4441,
    opening_hours: {
      lundi: '8:00-20:00',
      mardi: '8:00-20:00',
      mercredi: '8:00-20:00',
      jeudi: '8:00-20:00',
      vendredi: '8:00-20:00',
      samedi: '9:00-18:00',
      dimanche: 'Fermé',
    },
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'p2',
    name: 'Pharmacie des Almadies',
    address: 'Route des Almadies, Dakar',
    phone: '+221 33 820 45 67',
    latitude: 14.7289,
    longitude: -17.4927,
    opening_hours: {
      lundi: '8:00-22:00',
      mardi: '8:00-22:00',
      mercredi: '8:00-22:00',
      jeudi: '8:00-22:00',
      vendredi: '8:00-22:00',
      samedi: '8:00-22:00',
      dimanche: '9:00-18:00',
    },
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'p3',
    name: 'Pharmacie du Point E',
    address: 'Point E, Dakar',
    phone: '+221 33 825 78 90',
    latitude: 14.7167,
    longitude: -17.4578,
    opening_hours: {
      lundi: '7:30-21:00',
      mardi: '7:30-21:00',
      mercredi: '7:30-21:00',
      jeudi: '7:30-21:00',
      vendredi: '7:30-21:00',
      samedi: '8:00-20:00',
      dimanche: '10:00-16:00',
    },
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const mockInventory: PharmacyInventory[] = [
  {
    id: 'i1',
    pharmacy_id: 'p1',
    medicine_id: '1',
    quantity: 150,
    price: 500,
    expiry_date: '2025-12-31',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'i2',
    pharmacy_id: 'p1',
    medicine_id: '2',
    quantity: 80,
    price: 1200,
    expiry_date: '2025-10-15',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'i3',
    pharmacy_id: 'p1',
    medicine_id: '3',
    quantity: 45,
    price: 3500,
    expiry_date: '2025-08-20',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'i4',
    pharmacy_id: 'p2',
    medicine_id: '1',
    quantity: 200,
    price: 450,
    expiry_date: '2026-01-30',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'i5',
    pharmacy_id: 'p2',
    medicine_id: '4',
    quantity: 120,
    price: 800,
    expiry_date: '2025-11-10',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'i6',
    pharmacy_id: 'p2',
    medicine_id: '5',
    quantity: 95,
    price: 600,
    expiry_date: '2025-09-25',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'i7',
    pharmacy_id: 'p3',
    medicine_id: '2',
    quantity: 60,
    price: 1100,
    expiry_date: '2025-07-18',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'i8',
    pharmacy_id: 'p3',
    medicine_id: '4',
    quantity: 85,
    price: 750,
    expiry_date: '2025-12-05',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'i9',
    pharmacy_id: 'p3',
    medicine_id: '5',
    quantity: 110,
    price: 550,
    expiry_date: '2026-02-14',
    updated_at: new Date().toISOString(),
  },
];

export let mockOrders: Order[] = [
  {
    id: 'o1',
    user_id: 'user1',
    pharmacy_id: 'p1',
    total_amount: 2400,
    delivery_address: 'Rue 10, Sacré-Coeur, Dakar',
    delivery_phone: '+221 77 123 45 67',
    status: 'delivered',
    payment_status: 'paid',
    payment_method: 'cash',
    notes: 'Sonnez à l\'interphone',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'o2',
    user_id: 'user1',
    pharmacy_id: 'p2',
    total_amount: 1600,
    delivery_address: 'Rue 10, Sacré-Coeur, Dakar',
    delivery_phone: '+221 77 123 45 67',
    status: 'delivering',
    payment_status: 'paid',
    payment_method: 'mobile_money',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export let mockOrderItems: OrderItem[] = [
  {
    id: 'oi1',
    order_id: 'o1',
    medicine_id: '1',
    quantity: 2,
    unit_price: 500,
    subtotal: 1000,
  },
  {
    id: 'oi2',
    order_id: 'o1',
    medicine_id: '2',
    quantity: 1,
    unit_price: 1200,
    subtotal: 1200,
  },
  {
    id: 'oi3',
    order_id: 'o2',
    medicine_id: '4',
    quantity: 2,
    unit_price: 800,
    subtotal: 1600,
  },
];

export let mockReminders: MedicationReminder[] = [
  {
    id: 'r1',
    user_id: 'user1',
    medicine_id: '3',
    reminder_times: ['08:00', '14:00', '20:00'],
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    is_active: true,
    notes: 'Prendre avec de la nourriture',
    created_at: new Date().toISOString(),
  },
  {
    id: 'r2',
    user_id: 'user1',
    medicine_id: '1',
    reminder_times: ['09:00', '21:00'],
    start_date: new Date().toISOString().split('T')[0],
    is_active: true,
    notes: 'En cas de douleur',
    created_at: new Date().toISOString(),
  },
];

export let mockPrescriptions: Prescription[] = [
  {
    id: 'pr1',
    user_id: 'user1',
    image_url: 'https://example.com/prescription1.jpg',
    ocr_text: 'Amoxicilline\nParacétamol\nIbuprofène',
    doctor_name: 'Diop',
    prescription_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    status: 'processed',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'pr2',
    user_id: 'user1',
    image_url: 'https://example.com/prescription2.jpg',
    status: 'pending',
    created_at: new Date().toISOString(),
  },
];

export let mockProfiles: { [key: string]: Profile } = {
  user1: {
    id: 'user1',
    full_name: 'Amadou Sow',
    phone: '+221 77 123 45 67',
    address: 'Rue 10, Sacré-Coeur, Dakar',
    date_of_birth: '1990-05-15',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export let mockConversations: ChatConversation[] = [
  {
    id: 'c1',
    user_id: 'user1',
    title: 'Conversation santé',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export let mockMessages: ChatMessage[] = [
  {
    id: 'm1',
    conversation_id: 'c1',
    role: 'assistant',
    content:
      'Bonjour ! Je suis votre assistant santé MediConnect. Comment puis-je vous aider aujourd\'hui ?',
    created_at: new Date().toISOString(),
  },
];

export const mockUsers: { [email: string]: { password: string; id: string } } =
  {
    'test@example.com': { password: 'password123', id: 'user1' },
  };

export function addOrder(order: Order) {
  mockOrders = [...mockOrders, order];
}

export function addOrderItem(item: OrderItem) {
  mockOrderItems = [...mockOrderItems, item];
}

export function addPrescription(prescription: Prescription) {
  mockPrescriptions = [...mockPrescriptions, prescription];
}

export function updatePrescription(id: string, updates: Partial<Prescription>) {
  mockPrescriptions = mockPrescriptions.map((p) =>
    p.id === id ? { ...p, ...updates } : p
  );
}

export function addMessage(message: ChatMessage) {
  mockMessages = [...mockMessages, message];
}

export function updateProfile(userId: string, updates: Partial<Profile>) {
  if (mockProfiles[userId]) {
    mockProfiles[userId] = { ...mockProfiles[userId], ...updates };
  }
}

export function addUser(
  email: string,
  password: string,
  fullName: string
): string {
  const id = `user${Object.keys(mockUsers).length + 1}`;
  mockUsers[email] = { password, id };
  mockProfiles[id] = {
    id,
    full_name: fullName,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return id;
}
