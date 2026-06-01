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
    INSERT INTO DECK_CARDS (deck_id, card_id, quantity)
    VALUES (p_deck_id, p_card_id, 1)
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