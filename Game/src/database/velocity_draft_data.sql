-- ========================================================
-- FILE: velocity_draft_data.sql (ANTI-DUPLICATE VERSION)
-- DATABASE: velocity_draft_db
-- ========================================================

USE velocity_draft_db;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE CARD_Stats;
TRUNCATE TABLE DECK_CARDS;
TRUNCATE TABLE CARD_EFFECTS;
TRUNCATE TABLE CARD;
TRUNCATE TABLE DECK;
TRUNCATE TABLE PLAYER_GAME;
TRUNCATE TABLE RIVALS;
TRUNCATE TABLE GAMESESSION;
TRUNCATE TABLE PLAYER;
TRUNCATE TABLE USERS;

ALTER TABLE USERS AUTO_INCREMENT = 1;
ALTER TABLE PLAYER AUTO_INCREMENT = 1;
ALTER TABLE CARD AUTO_INCREMENT = 1;
ALTER TABLE CARD_EFFECTS AUTO_INCREMENT = 1;
ALTER TABLE GAMESESSION AUTO_INCREMENT = 1;
ALTER TABLE RIVALS AUTO_INCREMENT = 1;
ALTER TABLE DECK AUTO_INCREMENT = 1;
ALTER TABLE CARD_Stats AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. USERS
INSERT INTO USERS (user_id, email, username, password, age, gender) VALUES
(1, 'emilio@velocity.com', 'Emilio_Lara', 'emilio123', 20, 'Male'),
(2, 'oscar@velocity.com', 'Oscar_Lara', 'oscar123', 21, 'Male'),
(3, 'aixa@velocity.com', 'Aixa_Mendoza', 'aixa123', 20, 'Female'),
(4, 'checo@formula1.com', 'ChecoPerez', 'checo123', 36, 'Male'),
(5, 'guest_driver@velocity.com', 'GuestPlayer', 'guest123', 25, 'Other'),
(6, 'driver6@test.com', 'TurboRacer', 'pass123', 22, 'Male'),
(7, 'driver7@test.com', 'ApexPredator', 'pass123', 19, 'Female'),
(8, 'driver8@test.com', 'DriftKing', 'pass123', 24, 'Male'),
(9, 'driver9@test.com', 'SpeedyGonzales', 'pass123', 23, 'Male'),
(10, 'driver10@test.com', 'ShadowRider', 'pass123', 21, 'Female'),
(11, 'driver11@test.com', 'NitroBlast', 'pass123', 26, 'Male'),
(12, 'driver12@test.com', 'PixelBurner', 'pass123', 20, 'Other'),
(13, 'driver13@test.com', 'ShiftQueen', 'pass123', 22, 'Female'),
(14, 'driver14@test.com', 'AsphaltCowboy', 'pass123', 28, 'Male'),
(15, 'driver15@test.com', 'CyberSpeed', 'pass123', 25, 'Male'),
(16, 'driver16@test.com', 'VectorDrift', 'pass123', 18, 'Female'),
(17, 'driver17@test.com', 'OverdriveX', 'pass123', 30, 'Male'),
(18, 'driver18@test.com', 'GridRunner', 'pass123', 21, 'Male'),
(19, 'driver19@test.com', 'MachOne', 'pass123', 27, 'Male'),
(20, 'driver20@test.com', 'ViperBite', 'pass123', 23, 'Female'),
(21, 'driver21@test.com', 'HyperDrive', 'pass123', 24, 'Other'),
(22, 'driver22@test.com', 'ZenithRacer', 'pass123', 22, 'Male'),
(23, 'driver23@test.com', 'QuantumShift', 'pass123', 26, 'Female'),
(24, 'driver24@test.com', 'BlazeTrail', 'pass123', 19, 'Male'),
(25, 'driver25@test.com', 'NeonLight', 'pass123', 20, 'Female'),
(26, 'driver26@test.com', 'SonicBoom', 'pass123', 25, 'Male'),
(27, 'driver27@test.com', 'PulseRider', 'pass123', 22, 'Male'),
(28, 'driver28@test.com', 'InfinityLoop', 'pass123', 29, 'Other'),
(29, 'driver29@test.com', 'ApexChaser', 'pass123', 21, 'Female'),
(30, 'driver30@test.com', 'VelocityGhost', 'pass123', 24, 'Male'),
(31, 'driver31@test.com', 'RedlineX', 'pass123', 23, 'Male'),
(32, 'driver32@test.com', 'BurnoutPro', 'pass123', 27, 'Male'),
(33, 'driver33@test.com', 'ChronoDriver', 'pass123', 26, 'Female'),
(34, 'driver34@test.com', 'MatrixDrift', 'pass123', 20, 'Male'),
(35, 'driver35@test.com', 'ZephyrRider', 'pass123', 22, 'Female')
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);

-- 2. PLAYER
INSERT INTO PLAYER (player_id, user_id, game_name, car_level, average_race_time) VALUES
(1, 1, 'Emi', 3, 45.230), (2, 2, 'Oscar', 2, 48.120), (3, 3, 'Aixa', 2, 46.550),
(4, 4, 'RedBull11', 5, 41.890), (5, 5, 'Rookie99', 1, 55.400), (6, 6, 'TurboX', 2, 49.500),
(7, 7, 'ApexP', 3, 44.800), (8, 8, 'DKing', 4, 43.100), (9, 9, 'SpeedyG', 2, 47.900),
(10, 10, 'Shadow', 3, 46.200), (11, 11, 'NBlast', 1, 51.300), (12, 12, 'PBurner', 2, 48.700),
(13, 13, 'SQueen', 3, 45.900), (14, 14, 'AsphaltC', 2, 49.100), (15, 15, 'CyberS', 4, 42.800),
(16, 16, 'VectorD', 1, 53.600), (17, 17, 'Overdrive', 3, 46.000), (18, 18, 'GridR', 2, 48.300),
(19, 19, 'Mach1', 4, 43.500), (20, 20, 'ViperB', 3, 45.100), (21, 21, 'HDrive', 2, 47.200),
(22, 22, 'Zenith', 3, 44.900), (23, 23, 'QShift', 4, 42.600), (24, 24, 'BlazeT', 1, 52.100),
(25, 25, 'NeonL', 2, 49.800), (26, 26, 'SonicB', 3, 44.300), (27, 27, 'PulseR', 2, 46.900),
(28, 28, 'ILoop', 4, 43.000), (29, 29, 'ApexC', 3, 45.400), (30, 30, 'VGhost', 1, 54.200),
(31, 31, 'Redline', 3, 44.700), (32, 32, 'Burnout', 2, 48.000), (33, 33, 'ChronoD', 4, 42.100),
(34, 34, 'MatrixD', 2, 47.500), (35, 35, 'Zephyr', 3, 45.800)
ON DUPLICATE KEY UPDATE player_id=VALUES(player_id);

-- 3. CARD
INSERT INTO CARD (card_id, name, category) VALUES
(1, 'Aerodynamic Spoiler', 'Passive'), (2, 'Heavy Chassis', 'Passive'), (3, 'Sport Tires', 'Passive'),
(4, 'Racing Transmission', 'Passive'), (5, 'Tire Shredder', 'Active'), (6, 'Grappler Hook', 'Active'),
(7, 'Sonic Wave', 'Active'), (8, 'EMP', 'Active'), (9, 'Temporary Armor', 'Active'), (10, 'Repair Bot', 'Active')
ON DUPLICATE KEY UPDATE card_id=VALUES(card_id);

-- 4. CARD_EFFECTS
INSERT INTO CARD_EFFECTS (effect_id, card_id, effect_type, value) VALUES
(1, 1, 'Top Speed Boost', 15.00), (2, 2, 'Max HP Boost', 20.00), (3, 3, 'Steering Speed', 5.00),
(4, 4, 'Acceleration Boost', 25.00), (5, 5, 'Rival Speed Debuff', -30.00), (6, 6, 'Speed Steal', 10.00),
(7, 7, 'Push Force', 40.00), (8, 8, 'Disable Cards Time', 2.00), (9, 9, 'Shield Count', 1.00), (10, 10, 'Heal Percentage', 30.00)
ON DUPLICATE KEY UPDATE effect_id=VALUES(effect_id);

-- 5. GAMESESSION
INSERT INTO GAMESESSION (game_id, login_date, time_in_race) VALUES
(101, '2026-06-01 10:00:00', 135.450), (102, '2026-06-01 11:15:00', 142.110),
(103, '2026-06-01 14:30:00', 129.880), (104, '2026-06-01 16:45:00', 150.320),
(105, '2026-06-02 09:20:00', 131.220), (106, '2026-06-02 11:40:00', 138.900),
(107, '2026-06-02 13:10:00', 144.550), (108, '2026-06-02 15:55:00', 126.400),
(109, '2026-06-02 18:25:00', 155.100), (110, '2026-06-02 20:00:00', 140.050),
(111, '2026-06-03 10:15:00', 133.700), (112, '2026-06-03 12:30:00', 141.450),
(113, '2026-06-03 14:50:00', 128.990), (114, '2026-06-03 17:10:00', 149.000),
(115, '2026-06-03 19:40:00', 136.250), (116, '2026-06-04 08:30:00', 130.150),
(117, '2026-06-04 10:45:00', 143.800), (118, '2026-06-04 12:15:00', 139.600),
(119, '2026-06-04 15:00:00', 125.750), (120, '2026-06-04 17:20:00', 152.400),
(121, '2026-06-04 19:50:00', 137.900), (122, '2026-06-05 09:00:00', 132.500),
(123, '2026-06-05 11:10:00', 140.200), (124, '2026-06-05 13:40:00', 127.100),
(125, '2026-06-05 16:00:00', 148.650), (126, '2026-06-05 18:15:00', 134.300),
(127, '2026-06-05 20:30:00', 141.950), (128, '2026-06-06 10:00:00', 129.500),
(129, '2026-06-06 12:20:00', 145.800), (130, '2026-06-06 14:45:00', 138.250),
(131, '2026-06-06 17:00:00', 124.900), (132, '2026-06-06 19:15:00', 151.150),
(133, '2026-06-06 21:30:00', 136.600), (134, '2026-06-06 22:45:00', 140.400),
(135, '2026-06-06 23:50:00', 128.200)
ON DUPLICATE KEY UPDATE game_id=VALUES(game_id);

-- 6. RIVALS
INSERT INTO RIVALS (enemies_id, type, game_id, quantity_st_rivals) VALUES
(1, 'Aggressive', 101, 3), (2, 'Fast', 102, 2), (3, 'Strategic', 103, 4), (4, 'Evasives', 104, 3),
(5, 'Aggressive', 105, 2), (6, 'Fast', 106, 3), (7, 'Strategic', 107, 3), (8, 'Evasives', 108, 4),
(9, 'Aggressive', 109, 2), (10, 'Fast', 110, 3), (11, 'Strategic', 111, 4), (12, 'Evasives', 112, 2),
(13, 'Aggressive', 113, 3), (14, 'Fast', 114, 4), (15, 'Strategic', 115, 2), (16, 'Evasives', 116, 3),
(17, 'Aggressive', 117, 3), (18, 'Fast', 118, 2), (19, 'Strategic', 119, 4), (20, 'Evasives', 120, 3),
(21, 'Aggressive', 121, 2), (22, 'Fast', 122, 3), (23, 'Strategic', 123, 3), (24, 'Evasives', 124, 4),
(25, 'Aggressive', 125, 4), (26, 'Fast', 126, 2), (27, 'Strategic', 127, 3), (28, 'Evasives', 128, 3),
(29, 'Aggressive', 129, 2), (30, 'Fast', 130, 4), (31, 'Strategic', 131, 3), (32, 'Evasives', 132, 2),
(33, 'Aggressive', 133, 4), (34, 'Fast', 134, 3), (35, 'Strategic', 135, 2)
ON DUPLICATE KEY UPDATE enemies_id=VALUES(enemies_id);

-- 7. PLAYER_GAME
INSERT INTO PLAYER_GAME (player_id, game_id, position, total_play_time, fastest_lap) VALUES
(1, 101, 1, 135.450, 44.120), (1, 102, 3, 145.200, 46.890), (1, 103, 2, 131.100, 43.500),
(1, 104, 4, 152.300, 49.110), (1, 105, 1, 131.220, 42.900), (2, 106, 2, 138.900, 45.120),
(2, 107, 1, 144.550, 46.010), (2, 108, 3, 128.400, 43.990), (2, 109, 5, 158.200, 51.050),
(3, 110, 1, 140.050, 44.800), (3, 111, 2, 135.100, 43.900), (3, 112, 4, 143.500, 47.100),
(4, 113, 1, 128.990, 39.990), (4, 114, 1, 149.000, 41.150), (4, 115, 2, 137.400, 40.850),
(5, 116, 5, 130.150, 54.300), (5, 117, 4, 145.900, 56.100), (6, 118, 2, 139.600, 46.200),
(7, 119, 1, 125.750, 41.900), (8, 120, 1, 152.400, 42.500), (9, 121, 3, 139.000, 45.650),
(10, 122, 2, 134.100, 44.200), (11, 123, 4, 142.000, 49.900), (12, 124, 3, 129.500, 46.400),
(13, 125, 1, 148.650, 43.150), (14, 126, 4, 136.500, 48.000), (15, 127, 1, 141.950, 41.050),
(16, 128, 5, 131.000, 52.600), (17, 129, 2, 147.200, 45.100), (18, 130, 3, 139.800, 46.700),
(19, 131, 1, 124.900, 40.200), (20, 132, 2, 153.000, 44.100), (21, 133, 4, 138.500, 46.900),
(22, 134, 1, 140.400, 43.200), (23, 135, 1, 128.200, 41.800)
ON DUPLICATE KEY UPDATE player_id=player_id, game_id=game_id;

-- 8. DECK
INSERT INTO DECK (deck_id, name, player_id) VALUES
(1, 'Emi Meta Mazo', 1), (2, 'Oscar Fast Deck', 2), (3, 'Aixa Tech Mazo', 3),
(4, 'RedBull Aggro', 4), (5, 'Starter Pack', 5), (6, 'Turbo Build', 6),
(7, 'Apex Setup', 7), (8, 'Drift Loadout', 8), (9, 'Speedy Deck', 9),
(10, 'Shadow Set', 10), (11, 'Nitro Kit', 11), (12, 'Pixel Deck', 12),
(13, 'Shift Focus', 13), (14, 'Asphalt Grid', 14), (15, 'Cyber Build', 15),
(16, 'Vector Set', 16), (17, 'Overdrive Mazo', 17), (18, 'Grid Deck', 18),
(19, 'Mach Pack', 19), (20, 'Viper Setup', 20), (21, 'Hyper Kit', 21),
(22, 'Zenith Deck', 22), (23, 'Quantum Set', 23), (24, 'Blaze Mazo', 24),
(25, 'Neon Setup', 25), (26, 'Sonic Pack', 26), (27, 'Pulse Kit', 27),
(28, 'Loop Build', 28), (29, 'Chaser Set', 29), (30, 'Ghost Mazo', 30)
ON DUPLICATE KEY UPDATE deck_id=VALUES(deck_id);

-- 9. DECK_CARDS
INSERT INTO DECK_CARDS (deck_id, card_id, quantity, name_of_deck) VALUES
(1, 1, 2, 'Emi Meta Mazo'), (1, 6, 1, 'Emi Meta Mazo'), (1, 10, 1, 'Emi Meta Mazo'),
(2, 4, 2, 'Oscar Fast Deck'), (2, 5, 2, 'Oscar Fast Deck'), (3, 3, 2, 'Aixa Tech Mazo'),
(3, 8, 1, 'Aixa Tech Mazo'), (4, 1, 2, 'RedBull Aggro'), (4, 7, 2, 'RedBull Aggro'),
(5, 2, 2, 'Starter Pack'), (5, 9, 1, 'Starter Pack'), (6, 4, 2, 'Turbo Build'),
(7, 3, 2, 'Apex Setup'), (8, 5, 3, 'Drift Loadout'), (9, 1, 2, 'Speedy Deck'),
(10, 10, 2, 'Shadow Set'), (11, 4, 2, 'Nitro Kit'), (12, 2, 1, 'Pixel Deck'),
(13, 3, 2, 'Shift Focus'), (14, 5, 1, 'Asphalt Grid'), (15, 1, 3, 'Cyber Build'),
(16, 9, 2, 'Vector Set'), (17, 4, 2, 'Overdrive Mazo'), (18, 3, 1, 'Grid Deck'),
(19, 7, 2, 'Mach Pack'), (20, 6, 2, 'Viper Setup'), (21, 1, 2, 'Hyper Kit'),
(22, 10, 1, 'Zenith Deck'), (23, 8, 2, 'Quantum Set'), (24, 2, 2, 'Blaze Mazo'),
(25, 3, 2, 'Neon Setup'), (26, 4, 1, 'Sonic Pack'), (27, 5, 2, 'Pulse Kit'),
(28, 1, 2, 'Loop Build'), (29, 6, 2, 'Chaser Set'), (30, 9, 1, 'Ghost Mazo')
ON DUPLICATE KEY UPDATE deck_id=deck_id, card_id=card_id;

-- 10. CARD_Stats
INSERT INTO CARD_Stats (usage_id, user_id, card_id, usage_count) VALUES
(1, 1, 1, 14), (2, 1, 10, 8), (3, 2, 4, 22), (4, 3, 6, 11), (5, 4, 1, 35),
(6, 4, 7, 28), (7, 5, 2, 5), (8, 6, 4, 12), (9, 7, 3, 19), (10, 8, 5, 24),
(11, 9, 1, 16), (12, 10, 10, 14), (13, 11, 4, 9), (14, 12, 2, 4), (15, 13, 3, 11),
(16, 14, 5, 7), (17, 15, 1, 30), (18, 16, 9, 6), (19, 17, 4, 15), (20, 18, 3, 8),
(21, 19, 7, 21), (22, 20, 6, 13), (23, 21, 1, 17), (24, 22, 10, 10), (25, 23, 8, 12),
(26, 24, 2, 9), (27, 25, 3, 14), (28, 26, 4, 20), (29, 27, 5, 18), (30, 28, 1, 25),
(31, 29, 6, 11), (32, 30, 9, 5), (33, 31, 1, 16), (34, 32, 4, 13), (35, 33, 10, 21)
ON DUPLICATE KEY UPDATE usage_id=VALUES(usage_id);

COMMIT;