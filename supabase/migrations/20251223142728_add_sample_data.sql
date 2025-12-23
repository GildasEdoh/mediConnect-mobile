/*
  # Add Sample Data for MediConnect

  1. Sample Medicines
    - Adds common medications with details
    - Includes both prescription and over-the-counter drugs
  
  2. Sample Pharmacies
    - Adds pharmacies in Lomé, Togo
    - Includes locations with coordinates
  
  3. Sample Inventory
    - Links medicines to pharmacies with prices and stock
*/

-- Insert sample medicines
INSERT INTO medicines (name, generic_name, description, dosage, form, manufacturer, requires_prescription, warnings) VALUES
('Paracétamol 500mg', 'Paracétamol', 'Antalgique et antipyrétique', '500mg', 'Comprimé', 'PharmaCo', false, 'Ne pas dépasser 4g par jour'),
('Ibuprofène 400mg', 'Ibuprofène', 'Anti-inflammatoire non stéroïdien', '400mg', 'Comprimé', 'MediLab', false, 'À prendre pendant les repas'),
('Amoxicilline 500mg', 'Amoxicilline', 'Antibiotique de la famille des pénicillines', '500mg', 'Gélule', 'AntibioPlus', true, 'Traitement complet nécessaire même en cas d''amélioration'),
('Doliprane 1000mg', 'Paracétamol', 'Antalgique et antipyrétique', '1000mg', 'Comprimé', 'Sanofi', false, 'Ne pas associer avec d''autres médicaments contenant du paracétamol'),
('Nurofen 200mg', 'Ibuprofène', 'Anti-inflammatoire et antalgique', '200mg', 'Comprimé', 'Reckitt', false, 'Contre-indiqué en cas d''ulcère gastrique'),
('Augmentin 1g', 'Amoxicilline + Acide clavulanique', 'Antibiotique à large spectre', '1g', 'Comprimé', 'GSK', true, 'Respecter la posologie prescrite'),
('Efferalgan 500mg', 'Paracétamol', 'Antalgique et antipyrétique effervescent', '500mg', 'Comprimé effervescent', 'BMS', false, 'Dissoudre dans un verre d''eau'),
('Aspirine 500mg', 'Acide acétylsalicylique', 'Antalgique, antipyrétique et antiagrégant plaquettaire', '500mg', 'Comprimé', 'Bayer', false, 'Contre-indiqué chez les enfants de moins de 16 ans'),
('Metformine 850mg', 'Metformine', 'Antidiabétique oral', '850mg', 'Comprimé', 'DiabetoCare', true, 'À prendre pendant ou après les repas'),
('Oméprazole 20mg', 'Oméprazole', 'Inhibiteur de la pompe à protons', '20mg', 'Gélule', 'GastroMed', true, 'À prendre le matin à jeun')
ON CONFLICT DO NOTHING;

-- Insert sample pharmacies in Lomé, Togo
INSERT INTO pharmacies (name, address, phone, latitude, longitude, opening_hours, is_active) VALUES
('Pharmacie du Centre', 'Avenue de la Libération, Lomé', '+228 22 21 34 56', 6.131944, 1.222222, '{"lundi": "8h-20h", "mardi": "8h-20h", "mercredi": "8h-20h", "jeudi": "8h-20h", "vendredi": "8h-20h", "samedi": "8h-18h", "dimanche": "9h-13h"}', true),
('Pharmacie de l''Étoile', 'Boulevard du 13 Janvier, Lomé', '+228 22 22 45 67', 6.127778, 1.212778, '{"lundi": "7h30-21h", "mardi": "7h30-21h", "mercredi": "7h30-21h", "jeudi": "7h30-21h", "vendredi": "7h30-21h", "samedi": "8h-20h", "dimanche": "Fermé"}', true),
('Pharmacie Saint-Joseph', 'Rue de la Gare, Lomé', '+228 22 23 56 78', 6.135556, 1.225000, '{"lundi": "8h-19h", "mardi": "8h-19h", "mercredi": "8h-19h", "jeudi": "8h-19h", "vendredi": "8h-19h", "samedi": "8h-17h", "dimanche": "9h-12h"}', true),
('Pharmacie du Port', 'Avenue du 24 Janvier, Lomé', '+228 22 24 67 89', 6.128889, 1.217778, '{"lundi": "8h-20h", "mardi": "8h-20h", "mercredi": "8h-20h", "jeudi": "8h-20h", "vendredi": "8h-20h", "samedi": "8h-19h", "dimanche": "9h-14h"}', true),
('Pharmacie Moderne', 'Rue du Commerce, Lomé', '+228 22 25 78 90', 6.132222, 1.220000, '{"lundi": "7h30-20h30", "mardi": "7h30-20h30", "mercredi": "7h30-20h30", "jeudi": "7h30-20h30", "vendredi": "7h30-20h30", "samedi": "8h-19h", "dimanche": "8h30-13h"}', true)
ON CONFLICT DO NOTHING;

-- Insert sample inventory (linking medicines to pharmacies)
INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, quantity, price, expiry_date)
SELECT 
  p.id,
  m.id,
  FLOOR(RANDOM() * 100 + 20)::integer,
  CASE 
    WHEN m.name LIKE '%500mg%' THEN FLOOR(RANDOM() * 500 + 300)
    WHEN m.name LIKE '%1000mg%' OR m.name LIKE '%1g%' THEN FLOOR(RANDOM() * 800 + 500)
    WHEN m.name LIKE '%200mg%' THEN FLOOR(RANDOM() * 400 + 200)
    WHEN m.name LIKE '%400mg%' THEN FLOOR(RANDOM() * 600 + 300)
    ELSE FLOOR(RANDOM() * 1000 + 500)
  END,
  CURRENT_DATE + (FLOOR(RANDOM() * 365 + 180)::integer)
FROM pharmacies p
CROSS JOIN medicines m
WHERE RANDOM() > 0.3
ON CONFLICT DO NOTHING;