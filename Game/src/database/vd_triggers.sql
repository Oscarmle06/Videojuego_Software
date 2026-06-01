DELIMITER $$

-- Crear automáticamente un Deck por defecto ("Starter Deck") al registrar un nuevo PLAYER
CREATE TRIGGER tr_after_player_insert
AFTER INSERT ON PLAYER
FOR EACH ROW
BEGIN
    INSERT INTO DECK (name, player_id) 
    VALUES ('Starter Deck', NEW_PLAYER.player_id);
END$$

-- Validar que la edad del usuario sea realista antes de insertar
CREATE TRIGGER tr_before_user_insert
BEFORE INSERT ON USERS
FOR EACH ROW
BEGIN
    IF NEW.age < 0 OR NEW.age > 120 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: Edad no permitida para registro.';
    END IF;
END$$

-- Registrar de forma automática el uso de una carta en CARD_Stats al agregarla a un mazo
CREATE TRIGGER tr_after_deck_card_insert
AFTER INSERT ON DECK_CARDS
FOR EACH ROW
BEGIN
    -- Obtenemos el user_id a través del mazo
    DECLARE v_user_id INT;
    SELECT p.user_id INTO v_user_id 
    FROM DECK d 
    JOIN PLAYER p USING (player_id) 
    WHERE d.deck_id = NEW.deck_id;

    INSERT INTO CARD_Stats (user_id, card_id, usage_count)
    VALUES (v_user_id, NEW.card_id, 1)
    ON DUPLICATE KEY UPDATE usage_count = usage_count + 1;
END$$

-- Impedir que un mazo tenga más de 5 copias de la misma carta
CREATE TRIGGER tr_before_deck_card_update
BEFORE UPDATE ON DECK_CARDS
FOR EACH ROW
BEGIN
    IF NEW.quantity > 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: No puedes tener más de 5 copias de la misma carta en un mazo.';
    END IF;
END$$

-- Actualizar automáticamente el tiempo promedio de carrera del jugador cuando termina una sesión
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

-- Log de seguridad preventivo: Evitar cambios en el correo de usuarios registrados
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