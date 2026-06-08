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