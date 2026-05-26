CREATE DATABASE IF NOT EXISTS catcafe;
use catcafe;

-- 1. Tabla de Gatos
CREATE TABLE gatos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    edad VARCHAR(20) NOT NULL,
    caracter VARCHAR(255) NOT NULL,
    imagen VARCHAR(255) NOT NULL
);

-- 2. Tabla de Platillos/Bebidas
CREATE TABLE platillos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    imagen VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL
);

-- 3. Tabla intermedia para los Menús por Día
CREATE TABLE menu_dias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dia_semana ENUM('Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo') NOT NULL,
    platillo_id INT,
    FOREIGN KEY (platillo_id) REFERENCES platillos(id) ON DELETE CASCADE
);

-- Insertar Gatos
INSERT INTO gatos (nombre, edad, caracter, imagen) VALUES
('Naruto Uzumiau', '2 años', 'Hiperactivo y gritón', 'gatos/Naruto_Uzumiau.png'),
('Gato Uchiha', '3 años', 'Solitario', 'gatos/Gato_Uchiha.png'),
('Gatashi Hatake', '5 años', 'Relajado', 'gatos/Gatashi_Hatake.png'),
('Itachi Michi', '5 años', 'Maestro del Genjutsu para conseguir premios extra', 'gatos/Itachi_Michi.png'),
('Tsunade (La Quinta Ho-gata)', '6 años', 'Carácter fuerte...', 'gatos/Tsunade.png'),
('Orochimiau', '8 años', 'Se mete en cajas siempre', 'gatos/Orochimiau.png'),
('Madara Meow-chiha', '7 años', 'Muy Territorial', 'gatos/Madara_Meow_chiha.png'),
('Obito Gat-uchi', '4 años', 'Siempre llega tarde a comer por perderse en el camino', 'gatos/Obito_Gat-uchi.png');

-- Insertar todos los Platillos únicos (Catálogo)
INSERT INTO platillos (id, nombre, imagen, descripcion) VALUES
(1, 'Katon: Goyakatzu! (Onigiri)', 'comida/Lun1.png', 'Onigiris de arroz premium rellenos de salmón picante. Cada pieza es flambeada al momento con una técnica de fuego estilo Uchiha para un acabado crujiente.'),
(2, 'Té Verde del Bosque de la Muerte', 'comida/Lun2.png', 'Una infusión intensa de matcha orgánico y hierbas silvestres. Energizante y purificante, ideal para sobrevivir a cualquier examen Chunin.'),
(3, 'Chidori Fizz (Limonada Eléctrica)', 'comida/Mar1.png', 'Limonada artesanal con blue curacao y un toque de caramelo carbonatado que ''chisporrotea'' en tu boca como mil pájaros cantando.'),
(4, 'Sharin-gan-dwich de Jamón', 'comida/Mar2.png', 'Sándwich circular de pan artesanal con jamón serrano y queso provolone. El diseño del Sharingan está hecho con tomates deshidratados y aceitunas negras.'),
(5, 'Ramen Ichiraku-Gatuno Jr.', 'comida/Mie1.png', 'El clásico ramen de Miso favorito de Naruto, pero con un toque felino: narutomakis cortados con forma de gatito y un caldo cocinado por 12 horas.'),
(6, 'Dango de la Hoja (3 colores)', 'comida/Mie2.png', 'Brochetas de mochi dulce (rosa, blanco y verde). Tan suaves que incluso Itachi Uchiha haría una pausa en su misión para disfrutarlos.'),
(7, 'Amaterasu Black Latte', 'comida/Jue1.png', 'Café latte oscuro preparado con carbón activado y cacao amargo. Una bebida intensa cuyas sombras parecen arder eternamente in tu taza.'),
(8, 'Miau-gekyu Sharingan Toast', 'comida/Jue2.png', 'Tostada de pan brioche con crema de avellanas y fresas frescas dispuestas en el complejo patrón del Mangekyō. Dulce, visual y poderosa.'),
(9, 'Susanoo Soda (Mora Azul)', 'comida/Vie1.png', 'Soda de mora azul vibrante con esferas de nitrógeno que crean un aura mística alrededor del vaso. La defensa absoluta contra el calor.'),
(10, 'Takoyaki ''Tentáculos de Killer Bee''', 'comida/Vie2.png', 'Bolitas de pulpo fritas, sazonadas con salsa unagi y jengibre. Tan rítmicas y deliciosas que te harán querer rapear como el Jinchūriki del Ocho Colas.'),
(11, 'Jutsu Fuerza de un Centenar (Atún)', 'comida/Sab1.png', 'Tataki de atún sellado a la perfección. La disposición de los cortes emula el sello Byakugou de Lady Tsunade. Fuerza y elegancia en cada bocado.'),
(12, 'Onigiri Relleno Akatzu-ki', 'comida/Sab2.png', 'Onigiri envuelto en alga nori con una nube roja de paprika. Relleno de atún picante, representando la peligrosidad de la organización más buscada.'),
(13, 'Bolla de Fuego Uchiha (Mochi de Fresa)', 'comida/Dom1.png', 'Mochis artesanales rellenos de helado de fresa. Su exterior es suave como una nube y su sabor es tan explosivo como un jutsu de fuego.'),
(14, 'Café ''Sello Maldito'' (Cargado)', 'comida/Dom2.png', 'Espresso doble extra cargado. Su espuma lleva el diseño del sello de Orochimaru. Una dosis de energía oscura para despertar tus instintos.');

-- Asignar Platillos a sus respectivos Días
INSERT INTO menu_dias (dia_semana, platillo_id) VALUES
('Lunes', 1), ('Lunes', 2),
('Martes', 3), ('Martes', 4),
('Miércoles', 5), ('Miércoles', 6),
('Jueves', 7), ('Jueves', 8),
('Viernes', 9), ('Viernes', 10),
('Sábado', 11), ('Sábado', 12),
('Domingo', 13), ('Domingo', 14);