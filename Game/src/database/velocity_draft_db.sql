CREATE DATABASE IF NOT EXISTS velocity_draft_db;
USE velocity_draft_db;

-- 1. Tabla: USERS
CREATE TABLE IF NOT EXISTS USERS (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    age INT,
    gender VARCHAR(50)
);

-- 2. Tabla: PLAYER
CREATE TABLE IF NOT EXISTS PLAYER (
    player_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_name VARCHAR(100),
    car_level INT DEFAULT 1,
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