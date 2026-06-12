-- ============================================================
-- Velocity Draft — Complete Database Script
-- Run this file to create and initialize the full database.
-- Order: Schema → Seed Data → Views → Stored Procedures → Triggers
-- ============================================================

-- ── 1. SCHEMA (DDL) ──
-- velocity_draft_db.sql
-- Database schema for Velocity Draft game. This script creates the necessary tables to store user information, player profiles, game sessions, rivals, decks, cards, and their effects. It also defines the relationships between tables using foreign keys and sets up constraints for data integrity. This schema is designed to support the core functionalities of the game, including player management, game tracking, and card usage statistics.
-- Oscar Lara, Emilio Lara, Aixa Mendoza, June 2026

CREATE DATABASE IF NOT EXISTS velocity_draft_db;
USE velocity_draft_db;

-- 1. Tabla: USERS
CREATE TABLE IF NOT EXISTS USERS (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    age INT,
    gender VARCHAR(50),
    role varchar(20) DEFAULT 'player'
);

-- 2. Tabla: PLAYER
CREATE TABLE IF NOT EXISTS PLAYER (
    player_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_name VARCHAR(100),
    car_level INT DEFAULT 1,
    current_level INT NOT NULL DEFAULT 1,
    average_race_time DECIMAL(10, 3),
    CONSTRAINT fk_player_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

-- 3. Tabla: GAMESESSION
CREATE TABLE IF NOT EXISTS GAMESESSION (
    game_id INT AUTO_INCREMENT PRIMARY KEY,
    login_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    time_in_race DECIMAL(10, 3)
);

-- 4. Tabla: RIVALS
CREATE TABLE IF NOT EXISTS RIVALS (
    enemies_id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(100),
    game_id INT NOT NULL,
    quantity_st_rivals INT,
    CONSTRAINT fk_rivals_game FOREIGN KEY (game_id) REFERENCES GAMESESSION(game_id) ON DELETE CASCADE
);

-- 5. Tabla: PLAYER_GAME (Tabla Intermedia / Llave Primaria Compuesta)
CREATE TABLE IF NOT EXISTS PLAYER_GAME (
    player_id INT NOT NULL,
    game_id INT NOT NULL,
    position INT,
    total_play_time DECIMAL(10, 3),
    fastest_lap DECIMAL(10, 3),
    race_level INT NOT NULL DEFAULT 1,
    PRIMARY KEY (player_id, game_id),
    CONSTRAINT fk_pg_player FOREIGN KEY (player_id) REFERENCES PLAYER(player_id) ON DELETE CASCADE,
    CONSTRAINT fk_pg_game FOREIGN KEY (game_id) REFERENCES GAMESESSION(game_id) ON DELETE CASCADE
);

-- 6. Tabla: DECK
CREATE TABLE IF NOT EXISTS DECK (
    deck_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    player_id INT NOT NULL,
    CONSTRAINT fk_deck_player FOREIGN KEY (player_id) REFERENCES PLAYER(player_id) ON DELETE CASCADE
);

-- 7. Tabla: CARD
CREATE TABLE IF NOT EXISTS CARD (
    card_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    CONSTRAINT unique_card_name UNIQUE (name)
);

-- 8. Tabla: DECK_CARDS (Tabla Intermedia / Llave Primaria Compuesta)
CREATE TABLE IF NOT EXISTS DECK_CARDS (
    deck_id INT NOT NULL,
    card_id INT NOT NULL,
    quantity INT DEFAULT 1,
    name_of_deck VARCHAR(100),
    PRIMARY KEY (deck_id, card_id),
    CONSTRAINT fk_dc_deck FOREIGN KEY (deck_id) REFERENCES DECK(deck_id) ON DELETE CASCADE,
    CONSTRAINT fk_dc_card FOREIGN KEY (card_id) REFERENCES CARD(card_id) ON DELETE CASCADE
);

-- 9. Tabla: CARD_EFFECTS
CREATE TABLE IF NOT EXISTS CARD_EFFECTS (
    effect_id INT AUTO_INCREMENT PRIMARY KEY,
    card_id INT NOT NULL,
    effect_type VARCHAR(100) NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_effects_card FOREIGN KEY (card_id) REFERENCES CARD(card_id) ON DELETE CASCADE
);

-- 10. Tabla: CARD_Stats
CREATE TABLE IF NOT EXISTS CARD_Stats (
    usage_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    card_id INT NOT NULL,
    usage_count INT DEFAULT 1,
    CONSTRAINT fk_stats_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_stats_card FOREIGN KEY (card_id) REFERENCES CARD(card_id) ON DELETE CASCADE
);

-- 11. Tabla: CARD_RACE_USAGE
-- Real per-race card telemetry used by admin analytics.
CREATE TABLE IF NOT EXISTS CARD_RACE_USAGE (
    player_id INT NOT NULL,
    game_id INT NOT NULL,
    card_id INT NOT NULL,
    selected_count INT NOT NULL DEFAULT 1,
    activated_count INT NOT NULL DEFAULT 0,
    PRIMARY KEY (player_id, game_id, card_id),
    CONSTRAINT fk_cru_player_game FOREIGN KEY (player_id, game_id) REFERENCES PLAYER_GAME(player_id, game_id) ON DELETE CASCADE,
    CONSTRAINT fk_cru_card FOREIGN KEY (card_id) REFERENCES CARD(card_id) ON DELETE CASCADE
);

-- ── 2. SEED DATA (DML) ──
-- velocity_draft_data.sql
-- Data initialization script for Velocity Draft game database. This script creates the necessary tables and populates them using sample data for testing and development purposes. It also includes commands to reset the database state for consistent testing.
-- Oscar Lara, Emilio Lara, Aixa Mendoza, June 2026

USE velocity_draft_db;

-- 1. USERS
INSERT INTO USERS (user_id, email, username, password, age, gender, role) VALUES
(1, 'emilio@velocity.com', 'Emilio_Lara', 'emilio123', 20, 'Male', 'admin'),
(2, 'oscar@velocity.com', 'Oscar_Lara', 'oscar123', 21, 'Male', 'user'),
(3, 'aixa@velocity.com', 'Aixa_Mendoza', 'aixa123', 20, 'Female', 'user'),
(4, 'checo@formula1.com', 'ChecoPerez', 'checo123', 36, 'Male', 'user'),
(5, 'guest_driver@velocity.com', 'GuestPlayer', 'guest123', 25, 'Other', 'user'),
(6, 'driver6@test.com', 'TurboRacer', 'pass123', 22, 'Male', 'user'),
(7, 'driver7@test.com', 'ApexPredator', 'pass123', 19, 'Female', 'user'),
(8, 'driver8@test.com', 'DriftKing', 'pass123', 24, 'Male', 'user'),
(9, 'driver9@test.com', 'SpeedyGonzales', 'pass123', 23, 'Male', 'user'),
(10, 'driver10@test.com', 'ShadowRider', 'pass123', 21, 'Female', 'user'),
(11, 'driver11@test.com', 'NitroBlast', 'pass123', 26, 'Male', 'user'),
(12, 'driver12@test.com', 'PixelBurner', 'pass123', 20, 'Other', 'user'),
(13, 'driver13@test.com', 'ShiftQueen', 'pass123', 22, 'Female', 'user'),
(14, 'driver14@test.com', 'AsphaltCowboy', 'pass123', 28, 'Male', 'user'),
(15, 'driver15@test.com', 'CyberSpeed', 'pass123', 25, 'Male', 'user'),
(16, 'driver16@test.com', 'VectorDrift', 'pass123', 18, 'Female', 'user'),
(17, 'driver17@test.com', 'OverdriveX', 'pass123', 30, 'Male', 'user'),
(18, 'driver18@test.com', 'GridRunner', 'pass123', 21, 'Male', 'user'),
(19, 'driver19@test.com', 'MachOne', 'pass123', 27, 'Male', 'user'),
(20, 'driver20@test.com', 'ViperBite', 'pass123', 23, 'Female', 'user'),
(21, 'driver21@test.com', 'HyperDrive', 'pass123', 24, 'Other', 'user'),
(22, 'driver22@test.com', 'ZenithRacer', 'pass123', 22, 'Male', 'user'),
(23, 'driver23@test.com', 'QuantumShift', 'pass123', 26, 'Female', 'user'),
(24, 'driver24@test.com', 'BlazeTrail', 'pass123', 19, 'Male', 'user'),
(25, 'driver25@test.com', 'NeonLight', 'pass123', 20, 'Female', 'user'),
(26, 'driver26@test.com', 'SonicBoom', 'pass123', 25, 'Male', 'user'),
(27, 'driver27@test.com', 'PulseRider', 'pass123', 22, 'Male', 'user'),
(28, 'driver28@test.com', 'InfinityLoop', 'pass123', 29, 'Other', 'user'),
(29, 'driver29@test.com', 'ApexChaser', 'pass123', 21, 'Female', 'user'),
(30, 'driver30@test.com', 'VelocityGhost', 'pass123', 24, 'Male', 'user'),
(31, 'driver31@test.com', 'RedlineX', 'pass123', 23, 'Male', 'user'),
(32, 'driver32@test.com', 'BurnoutPro', 'pass123', 27, 'Male', 'user'),
(33, 'driver33@test.com', 'ChronoDriver', 'pass123', 26, 'Female', 'user'),
(34, 'driver34@test.com', 'MatrixDrift', 'pass123', 20, 'Male', 'user'),
(35, 'driver35@test.com', 'ZephyrRider', 'pass123', 22, 'Female', 'user')
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

-- CARD and CARD_EFFECTS use real game data for future use in the game logic and balance testing.

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
INSERT INTO PLAYER_GAME (player_id, game_id, position, total_play_time, fastest_lap, race_level) VALUES
(1, 101, 1, 135.450, 44.120, 1), (1, 102, 3, 145.200, 46.890, 2), (1, 103, 2, 131.100, 43.500, 3),
(1, 104, 4, 152.300, 49.110, 4), (1, 105, 1, 131.220, 42.900, 5), (2, 106, 2, 138.900, 45.120, 1),
(2, 107, 1, 144.550, 46.010, 2), (2, 108, 3, 128.400, 43.990, 3), (2, 109, 5, 158.200, 51.050, 4),
(3, 110, 1, 140.050, 44.800, 1), (3, 111, 2, 135.100, 43.900, 2), (3, 112, 4, 143.500, 47.100, 3),
(4, 113, 1, 128.990, 39.990, 1), (4, 114, 1, 149.000, 41.150, 2), (4, 115, 2, 137.400, 40.850, 3),
(5, 116, 5, 130.150, 54.300, 1), (5, 117, 4, 145.900, 56.100, 2), (6, 118, 2, 139.600, 46.200, 1),
(7, 119, 1, 125.750, 41.900, 1), (8, 120, 1, 152.400, 42.500, 1), (9, 121, 3, 139.000, 45.650, 1),
(10, 122, 2, 134.100, 44.200, 1), (11, 123, 4, 142.000, 49.900, 1), (12, 124, 3, 129.500, 46.400, 1),
(13, 125, 1, 148.650, 43.150, 1), (14, 126, 4, 136.500, 48.000, 1), (15, 127, 1, 141.950, 41.050, 1),
(16, 128, 5, 131.000, 52.600, 1), (17, 129, 2, 147.200, 45.100, 1), (18, 130, 3, 139.800, 46.700, 1),
(19, 131, 1, 124.900, 40.200, 1), (20, 132, 2, 153.000, 44.100, 1), (21, 133, 4, 138.500, 46.900, 1),
(22, 134, 1, 140.400, 43.200, 1), (23, 135, 1, 128.200, 41.800, 1)
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

-- 11. CARD_RACE_USAGE
INSERT INTO CARD_RACE_USAGE (player_id, game_id, card_id, selected_count, activated_count) VALUES
(1, 101, 1, 1, 0), (1, 102, 10, 1, 1), (1, 103, 6, 1, 1), (1, 104, 2, 1, 0), (1, 105, 7, 1, 1),
(2, 106, 4, 1, 0), (2, 107, 5, 1, 1), (2, 108, 1, 1, 0), (2, 109, 9, 1, 1),
(3, 110, 3, 1, 0), (3, 111, 8, 1, 1), (3, 112, 6, 1, 0),
(4, 113, 1, 1, 0), (4, 114, 7, 1, 1), (4, 115, 4, 1, 0),
(5, 116, 2, 1, 0), (5, 117, 9, 1, 1), (6, 118, 4, 1, 0),
(7, 119, 3, 1, 0), (8, 120, 5, 1, 1), (9, 121, 1, 1, 0),
(10, 122, 10, 1, 1), (11, 123, 4, 1, 0), (12, 124, 2, 1, 0),
(13, 125, 3, 1, 0), (14, 126, 5, 1, 1), (15, 127, 1, 1, 0),
(16, 128, 9, 1, 1), (17, 129, 4, 1, 0), (18, 130, 3, 1, 0),
(19, 131, 7, 1, 1), (20, 132, 6, 1, 1), (21, 133, 1, 1, 0),
(22, 134, 10, 1, 1), (23, 135, 8, 1, 1)
ON DUPLICATE KEY UPDATE selected_count=VALUES(selected_count), activated_count=VALUES(activated_count);

COMMIT;

-- ── 3. VIEWS ──
-- vd_views.sql
-- SQL views for Velocity Draft game database. This script defines various views to simplify data retrieval and reporting for player profiles, deck compositions, card effects, race leaderboards, session analytics, and more. These views are designed to provide easy access to commonly needed data for both the game logic and potential administrative dashboards.
-- Oscar Lara, Emilio Lara, Aixa Mendoza, June 2026

-- Perfil completo del jugador con su cuenta de usuario
CREATE VIEW vw_player_profiles AS
SELECT p.player_id, u.username, u.email, p.game_name, p.car_level, p.average_race_time
FROM PLAYER p
JOIN USERS u USING (user_id);

-- Detalle de deck por jugador
CREATE VIEW vw_player_decks AS
SELECT p.game_name, d.deck_id, d.name AS deck_name
FROM DECK d
JOIN PLAYER p USING (player_id);

-- Cartas contenidas en cada mazo por cantidades
CREATE VIEW vw_deck_compositions AS
SELECT d.name AS deck_name, c.name AS card_name, c.category, dc.quantity
FROM DECK_CARDS dc
JOIN DECK d USING (deck_id)
JOIN CARD c USING (card_id);

-- Efectos detallados de cada carta
CREATE VIEW vw_card_effects_detail AS
SELECT c.name AS card_name, c.category, ce.effect_type, ce.value
FROM CARD_EFFECTS ce
JOIN CARD c USING (card_id);

-- Historial de posiciones
CREATE VIEW vw_race_leaderboards AS
SELECT pg.game_id, p.game_name, pg.position, pg.fastest_lap, gs.login_date
FROM PLAYER_GAME pg
JOIN PLAYER p USING (player_id)
JOIN GAMESESSION gs USING (game_id);

-- Rivales enfrentados por sesión de juego
CREATE VIEW vw_session_rivals AS
SELECT r.game_id, r.type AS rival_type, r.quantity_st_rivals, gs.login_date
FROM RIVALS r
JOIN GAMESESSION gs USING (game_id);

-- Top cartas más usadas
CREATE VIEW vw_top_used_cards AS
SELECT c.name AS card_name, SUM(cs.usage_count) AS total_uses
FROM CARD_Stats cs
JOIN CARD c USING (card_id)
GROUP BY c.card_id
ORDER BY total_uses DESC;

-- Resumen estadístico de usuarios (Edades y géneros)
CREATE VIEW vw_user_demographics AS
SELECT gender, COUNT(*) AS total_users, AVG(age) AS average_age
FROM USERS
GROUP BY gender;

-- Jugadores con nivel de auto alto
CREATE VIEW vw_high_level_players AS
SELECT game_name, car_level, average_race_time
FROM PLAYER
WHERE car_level >= 4;

-- Reporte global de sesiones y tiempos totales de juego
CREATE VIEW vw_session_analytics AS
SELECT pg.game_id, COUNT(pg.player_id) AS total_players, AVG(pg.total_play_time) AS avg_session_time
FROM PLAYER_GAME pg
GROUP BY pg.game_id;
-- ── 4. STORED PROCEDURES ──
-- vd_sp.sql
-- Stored procedures for Velocity Draft game database. This script defines various stored procedures to handle common operations such as player registration, car upgrades, deck management, game session creation, and result recording. These procedures encapsulate the business logic for interacting with the database, ensuring data integrity and simplifying application development.
-- Oscar Lara, Emilio Lara, Aixa Mendoza, June 2026

DELIMITER $$

-- Registrar un nuevo jugador vinculándolo a su usuario
CREATE PROCEDURE sp_register_player(
    IN p_user_id INT,
    IN p_game_name VARCHAR(100)
)
BEGIN
    INSERT INTO PLAYER (user_id, game_name, car_level, average_race_time)
    VALUES (p_user_id, p_game_name, 1, 0.000);
END$$

-- Subir de nivel el auto de un jugador
CREATE PROCEDURE sp_upgrade_car(
    IN p_player_id INT
)
BEGIN
    UPDATE PLAYER 
    SET car_level = car_level + 1 
    WHERE player_id = p_player_id;
END$$

-- Añadir una carta a un mazo específico controlando duplicados
CREATE PROCEDURE sp_add_card_to_deck(
    IN p_deck_id INT,
    IN p_card_id INT
)
BEGIN
    DECLARE v_deck_name VARCHAR(100);
    SELECT name INTO v_deck_name FROM DECK WHERE deck_id = p_deck_id;

    INSERT INTO DECK_CARDS (deck_id, card_id, quantity, name_of_deck)
    VALUES (p_deck_id, p_card_id, 1, v_deck_name)
    ON DUPLICATE KEY UPDATE quantity = quantity + 1;
END$$

-- Crear una nueva sesión de juego y asociarle rivales automáticamente
CREATE PROCEDURE sp_create_game_session(
    IN p_rival_type VARCHAR(100),
    IN p_rival_qty INT,
    OUT o_game_id INT
)
BEGIN
    INSERT INTO GAMESESSION (login_date, time_in_race) VALUES (NOW(), 0.000);
    SET o_game_id = LAST_INSERT_ID();
    
    INSERT INTO RIVALS (type, game_id, quantity_st_rivals) 
    VALUES (p_rival_type, o_game_id, p_rival_qty);
END$$

-- Registrar los resultados finales de un jugador
CREATE PROCEDURE sp_record_race_result(
    IN p_player_id INT,
    IN p_game_id INT,
    IN p_position INT,
    IN p_total_time DECIMAL(10,3),
    IN p_fastest_lap DECIMAL(10,3)
)
BEGIN
    INSERT INTO PLAYER_GAME (player_id, game_id, position, total_play_time, fastest_lap)
    VALUES (p_player_id, p_game_id, p_position, p_total_time, p_fastest_lap);
END$$

-- Obtener el inventario de cartas de un jugador específico
CREATE PROCEDURE sp_get_player_inventory(
    IN p_player_id INT
)
BEGIN
    SELECT d.name AS mazo, c.name AS carta, dc.quantity
    FROM DECK d
    JOIN DECK_CARDS dc USING (deck_id)
    JOIN CARD c USING (card_id)
    WHERE d.player_id = p_player_id;
END$$

DELIMITER ;
-- ── 5. TRIGGERS ──
-- vd_triggers.sql
-- Triggers for Velocity Draft game database. This script defines various triggers to automate certain actions such as creating default decks for new players, validating user data, tracking card usage, and updating player statistics. These triggers help maintain data integrity and enforce business rules within the database, ensuring a consistent and reliable gaming experience.
-- Oscar Lara, Emilio Lara, Aixa Mendoza, June 2026

DELIMITER $$

-- 1. Crear automáticamente un Deck por defecto al registrar un nuevo PLAYER
CREATE TRIGGER tr_after_player_insert
AFTER INSERT ON PLAYER
FOR EACH ROW
BEGIN
    INSERT INTO DECK (name, player_id) 
    VALUES ('Default Starter Deck', NEW.player_id); -- Corregido: NEW en lugar de NEW_PLAYER
END$$

-- 2. Validar que la edad del usuario sea realista antes de insertar
CREATE TRIGGER tr_before_user_insert
BEFORE INSERT ON USERS
FOR EACH ROW
BEGIN
    IF NEW.age < 0 OR NEW.age > 120 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: Edad no permitida para registro.';
    END IF;
END$$

-- 3. Registrar de forma automática el uso de una carta en CARD_Stats
CREATE TRIGGER tr_after_deck_card_insert
AFTER INSERT ON DECK_CARDS
FOR EACH ROW
BEGIN
    DECLARE v_user_id INT;
    SELECT p.user_id INTO v_user_id 
    FROM DECK d 
    JOIN PLAYER p USING (player_id) 
    WHERE d.deck_id = NEW.deck_id;

    INSERT INTO CARD_Stats (user_id, card_id, usage_count)
    VALUES (v_user_id, NEW.card_id, 1)
    ON DUPLICATE KEY UPDATE usage_count = usage_count + 1; -- Corregido: Actualizar count, no el ID
END$$

-- 4. Impedir que un mazo tenga más de 5 copias de la misma carta
CREATE TRIGGER tr_before_deck_card_update
BEFORE UPDATE ON DECK_CARDS
FOR EACH ROW
BEGIN
    IF NEW.quantity > 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: No puedes tener más de 5 copias de la misma carta en un mazo.';
    END IF;
END$$

-- 5. Actualizar el tiempo promedio del jugador al terminar una sesión
CREATE TRIGGER tr_after_player_game_insert
AFTER INSERT ON PLAYER_GAME
FOR EACH ROW
BEGIN
    DECLARE v_avg DECIMAL(10,3);
    
    SELECT AVG(total_play_time) INTO v_avg 
    FROM PLAYER_GAME 
    WHERE player_id = NEW.player_id;
    
    UPDATE PLAYER 
    SET average_race_time = v_avg 
    WHERE player_id = NEW.player_id;
END$$

-- 6. Evitar cambios en el correo de usuarios registrados
CREATE TRIGGER tr_before_user_update
BEFORE UPDATE ON USERS
FOR EACH ROW
BEGIN
    IF OLD.email <> NEW.email THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No está permitido modificar el correo electrónico por razones de seguridad.';
    END IF;
END$$

DELIMITER ;