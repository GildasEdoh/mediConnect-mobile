export interface Profile {
  id: string;
  full_name: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  opening_hours: Record<string, any>;
  is_active: boolean;
  owner_id?: string;
  created_at: string;
}

export interface Medicine {
  id: string;
  name: string;
  generic_name?: string;
  description?: string;
  dosage?: string;
  form?: string;
  manufacturer?: string;
  requires_prescription: boolean;
  warnings?: string;
  interactions: any[];
  created_at: string;
}

export interface PharmacyInventory {
  id: string;
  pharmacy_id: string;
  medicine_id: string;
  quantity: number;
  price: number;
  expiry_date?: string;
  updated_at: string;
  medicine?: Medicine;
  pharmacy?: Pharmacy;
}

export interface Prescription {
  id: string;
  user_id: string;
  image_url?: string;
  ocr_text?: string;
  doctor_name?: string;
  prescription_date?: string;
  status: 'pending' | 'processed' | 'active' | 'completed';
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  pharmacy_id: string;
  prescription_id?: string;
  total_amount: number;
  delivery_address: string;
  delivery_phone: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  pharmacy?: Pharmacy;
}

export interface OrderItem {
  id: string;
  order_id: string;
  medicine_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  medicine?: Medicine;
}

export interface MedicationReminder {
  id: string;
  user_id: string;
  prescription_id?: string;
  medicine_id: string;
  reminder_times: string[];
  start_date: string;
  end_date?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  medicine?: Medicine;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}
