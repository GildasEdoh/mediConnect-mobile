/*
  # MediConnect Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `phone` (text)
      - `address` (text)
      - `date_of_birth` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `pharmacies`
      - `id` (uuid, primary key)
      - `name` (text)
      - `address` (text)
      - `phone` (text)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `opening_hours` (jsonb)
      - `is_active` (boolean)
      - `owner_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
    
    - `medicines`
      - `id` (uuid, primary key)
      - `name` (text)
      - `generic_name` (text)
      - `description` (text)
      - `dosage` (text)
      - `form` (text) - comprimé, sirop, etc.
      - `manufacturer` (text)
      - `requires_prescription` (boolean)
      - `warnings` (text)
      - `interactions` (jsonb)
      - `created_at` (timestamptz)
    
    - `pharmacy_inventory`
      - `id` (uuid, primary key)
      - `pharmacy_id` (uuid, references pharmacies)
      - `medicine_id` (uuid, references medicines)
      - `quantity` (integer)
      - `price` (decimal)
      - `expiry_date` (date)
      - `updated_at` (timestamptz)
    
    - `prescriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `image_url` (text)
      - `ocr_text` (text)
      - `doctor_name` (text)
      - `prescription_date` (date)
      - `status` (text) - pending, processed, active, completed
      - `created_at` (timestamptz)
    
    - `prescription_medicines`
      - `id` (uuid, primary key)
      - `prescription_id` (uuid, references prescriptions)
      - `medicine_id` (uuid, references medicines)
      - `dosage_instructions` (text)
      - `duration_days` (integer)
      - `frequency` (text)
    
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `pharmacy_id` (uuid, references pharmacies)
      - `prescription_id` (uuid, references prescriptions, nullable)
      - `total_amount` (decimal)
      - `delivery_address` (text)
      - `delivery_phone` (text)
      - `status` (text) - pending, confirmed, preparing, delivering, delivered, cancelled
      - `payment_status` (text) - pending, paid, failed
      - `payment_method` (text)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, references orders)
      - `medicine_id` (uuid, references medicines)
      - `quantity` (integer)
      - `unit_price` (decimal)
      - `subtotal` (decimal)
    
    - `medication_reminders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `prescription_id` (uuid, references prescriptions, nullable)
      - `medicine_id` (uuid, references medicines)
      - `reminder_times` (jsonb) - array of times
      - `start_date` (date)
      - `end_date` (date)
      - `is_active` (boolean)
      - `notes` (text)
      - `created_at` (timestamptz)
    
    - `chat_conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references chat_conversations)
      - `role` (text) - user, assistant
      - `content` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for pharmacies to manage their inventory
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  address text,
  date_of_birth date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create pharmacies table
CREATE TABLE IF NOT EXISTS pharmacies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  opening_hours jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  owner_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active pharmacies"
  ON pharmacies FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Pharmacy owners can update own pharmacy"
  ON pharmacies FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Create medicines table
CREATE TABLE IF NOT EXISTS medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  generic_name text,
  description text,
  dosage text,
  form text,
  manufacturer text,
  requires_prescription boolean DEFAULT false,
  warnings text,
  interactions jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view medicines"
  ON medicines FOR SELECT
  TO authenticated
  USING (true);

-- Create pharmacy_inventory table
CREATE TABLE IF NOT EXISTS pharmacy_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id uuid REFERENCES pharmacies(id) ON DELETE CASCADE NOT NULL,
  medicine_id uuid REFERENCES medicines(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 0,
  price decimal(10, 2) NOT NULL,
  expiry_date date,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(pharmacy_id, medicine_id)
);

ALTER TABLE pharmacy_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view inventory"
  ON pharmacy_inventory FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Pharmacy owners can manage inventory"
  ON pharmacy_inventory FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pharmacies
      WHERE pharmacies.id = pharmacy_inventory.pharmacy_id
      AND pharmacies.owner_id = auth.uid()
    )
  );

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url text,
  ocr_text text,
  doctor_name text,
  prescription_date date,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prescriptions"
  ON prescriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prescriptions"
  ON prescriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prescriptions"
  ON prescriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create prescription_medicines table
CREATE TABLE IF NOT EXISTS prescription_medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id uuid REFERENCES prescriptions(id) ON DELETE CASCADE NOT NULL,
  medicine_id uuid REFERENCES medicines(id) ON DELETE CASCADE NOT NULL,
  dosage_instructions text,
  duration_days integer,
  frequency text
);

ALTER TABLE prescription_medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prescription medicines"
  ON prescription_medicines FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prescriptions
      WHERE prescriptions.id = prescription_medicines.prescription_id
      AND prescriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own prescription medicines"
  ON prescription_medicines FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM prescriptions
      WHERE prescriptions.id = prescription_medicines.prescription_id
      AND prescriptions.user_id = auth.uid()
    )
  );

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pharmacy_id uuid REFERENCES pharmacies(id) ON DELETE CASCADE NOT NULL,
  prescription_id uuid REFERENCES prescriptions(id),
  total_amount decimal(10, 2) DEFAULT 0,
  delivery_address text NOT NULL,
  delivery_phone text NOT NULL,
  status text DEFAULT 'pending',
  payment_status text DEFAULT 'pending',
  payment_method text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pharmacy owners can view their pharmacy orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pharmacies
      WHERE pharmacies.id = orders.pharmacy_id
      AND pharmacies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Pharmacy owners can update their pharmacy orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pharmacies
      WHERE pharmacies.id = orders.pharmacy_id
      AND pharmacies.owner_id = auth.uid()
    )
  );

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  medicine_id uuid REFERENCES medicines(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL,
  unit_price decimal(10, 2) NOT NULL,
  subtotal decimal(10, 2) NOT NULL
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Create medication_reminders table
CREATE TABLE IF NOT EXISTS medication_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prescription_id uuid REFERENCES prescriptions(id),
  medicine_id uuid REFERENCES medicines(id) ON DELETE CASCADE NOT NULL,
  reminder_times jsonb DEFAULT '[]',
  start_date date NOT NULL,
  end_date date,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medication_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders"
  ON medication_reminders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON medication_reminders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON medication_reminders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON medication_reminders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create chat_conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text DEFAULT 'Nouvelle conversation',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON chat_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON chat_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON chat_conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON chat_conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES chat_conversations(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from own conversations"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
      AND chat_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own conversations"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
      AND chat_conversations.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pharmacies_location ON pharmacies(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_pharmacy_inventory_pharmacy ON pharmacy_inventory(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_inventory_medicine ON pharmacy_inventory(medicine_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_user ON prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_pharmacy ON orders(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_medication_reminders_user ON medication_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);