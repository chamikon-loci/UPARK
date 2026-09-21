INSERT INTO parkingLots (latitude, longitude, parkingLot_name, price_per_hour, open_time, close_time) VALUES
(13.756300, 100.501800, 'Siam Paragon Parking', 50, '2026-06-01 08:00:00', '2026-06-01 22:00:00'),
(13.746600, 100.539300, 'CentralwOrld Garage', 40, '2026-06-01 06:00:00', '2026-06-01 00:00:00'),
(13.737000, 100.560400, 'Terminal 21 Asok', 30, '2026-06-01 10:00:00', '2026-06-01 22:00:00'),
(13.720000, 100.529800, 'Silom Complex', 50, '2026-06-01 07:00:00', '2026-06-01 21:00:00'),
(13.824500, 100.552300, 'Central Ladprao', 30, '2026-06-01 06:00:00', '2026-06-01 00:00:00'),
(13.673200, 100.606700, 'Mega Bangna', 20, '2026-06-01 00:00:00', '2026-06-01 23:59:59'),
(13.719600, 100.542400, 'Samyan Mitrtown', 40, '2026-06-01 00:00:00', '2026-06-01 23:59:59'),
(13.730800, 100.569900, 'EmQuartier Parking', 60, '2026-06-01 10:00:00', '2026-06-01 22:00:00'),
(13.773600, 100.544100, 'Victory Monument Hub', 30, '2026-06-01 06:00:00', '2026-06-01 22:00:00'),
(13.704200, 100.602100, 'Seacon Square', 20, '2026-06-01 10:00:00', '2026-06-01 21:30:00');

INSERT INTO parkingSlots (parkingSlot_name, parkingLot_id, status) VALUES
('A-01', 1, 'Available'), ('A-02', 1, 'Occupied'), ('A-03', 1, 'Available'), ('A-04', 1, 'Maintenance'),
('B-01', 2, 'Available'), ('B-02', 2, 'Available'), ('B-03', 2, 'Occupied'), ('B-04', 2, 'Available'), ('B-05', 2, 'Occupied'),
('C-01', 3, 'Occupied'), ('C-02', 3, 'Available'), ('C-03', 3, 'Available'),
('D-01', 4, 'Available'), ('D-02', 4, 'Maintenance'), ('D-03', 4, 'Available'), ('D-04', 4, 'Occupied'),
('E-01', 5, 'Available'), ('E-02', 5, 'Available'), ('E-03', 5, 'Occupied'), ('E-04', 5, 'Occupied'), ('E-05', 5, 'Available'), ('E-06', 5, 'Available'),
('F-01', 6, 'Available'), ('F-02', 6, 'Occupied'), ('F-03', 6, 'Available'), ('F-04', 6, 'Available'),
('G-01', 7, 'Occupied'), ('G-02', 7, 'Available'), ('G-03', 7, 'Occupied'),
('H-01', 8, 'Available'), ('H-02', 8, 'Available'), ('H-03', 8, 'Available'), ('H-04', 8, 'Occupied'), ('H-05', 8, 'Maintenance'),
('I-01', 9, 'Available'), ('I-02', 9, 'Occupied'), ('I-03', 9, 'Available'),
('J-01', 10, 'Available'), ('J-02', 10, 'Available'), ('J-03', 10, 'Occupied'), ('J-04', 10, 'Available');