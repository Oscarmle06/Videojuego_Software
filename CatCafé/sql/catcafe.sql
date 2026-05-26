/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: catcafe
-- ------------------------------------------------------
-- Server version	10.11.14-MariaDB-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `gatos`
--

DROP TABLE IF EXISTS `gatos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `gatos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `edad` varchar(20) NOT NULL,
  `caracter` varchar(255) NOT NULL,
  `imagen` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gatos`
--

LOCK TABLES `gatos` WRITE;
/*!40000 ALTER TABLE `gatos` DISABLE KEYS */;
INSERT INTO `gatos` VALUES
(1,'Naruto Uzumiau','2 años','Hiperactivo y gritón','gatos/Naruto_Uzumiau.png'),
(2,'Gato Uchiha','3 años','Solitario','gatos/Gato_Uchiha.png'),
(3,'Gatashi Hatake','5 años','Relajado','gatos/Gatashi_Hatake.png'),
(4,'Itachi Michi','5 años','Maestro del Genjutsu para conseguir premios extra','gatos/Itachi_Michi.png'),
(5,'Tsunade (La Quinta Ho-gata)','6 años','Carácter fuerte...','gatos/Tsunade.png'),
(6,'Orochimiau','8 años','Se mete en cajas siempre','gatos/Orochimiau.png'),
(7,'Madara Meow-chiha','7 años','Muy Territorial','gatos/Madara_Meow_chiha.png'),
(8,'Obito Gat-uchi','4 años','Siempre llega tarde a comer por perderse en el camino','gatos/Obito_Gat-uchi.png');
/*!40000 ALTER TABLE `gatos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_dias`
--

DROP TABLE IF EXISTS `menu_dias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_dias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dia_semana` enum('Lunes','Martes','Miercoles','Jueves','Viernes','Sabado','Domingo') NOT NULL,
  `platillo_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `platillo_id` (`platillo_id`),
  CONSTRAINT `menu_dias_ibfk_1` FOREIGN KEY (`platillo_id`) REFERENCES `platillos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_dias`
--

LOCK TABLES `menu_dias` WRITE;
/*!40000 ALTER TABLE `menu_dias` DISABLE KEYS */;
INSERT INTO `menu_dias` VALUES
(1,'Lunes',1),
(2,'Lunes',2),
(3,'Martes',3),
(4,'Martes',4),
(5,'Miercoles',5),
(6,'Miercoles',6),
(7,'Jueves',7),
(8,'Jueves',8),
(9,'Viernes',9),
(10,'Viernes',10),
(11,'Sabado',11),
(12,'Sabado',12),
(13,'Domingo',13),
(14,'Domingo',14);
/*!40000 ALTER TABLE `menu_dias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platillos`
--

DROP TABLE IF EXISTS `platillos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `platillos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `imagen` varchar(255) NOT NULL,
  `descripcion` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platillos`
--

LOCK TABLES `platillos` WRITE;
/*!40000 ALTER TABLE `platillos` DISABLE KEYS */;
INSERT INTO `platillos` VALUES
(1,'Katon: Goyakatzu! (Onigiri)','comida/Lun1.png','Onigiris de arroz premium rellenos de salmón picante. Cada pieza es flambeada al momento con una técnica de fuego estilo Uchiha para un acabado crujiente.'),
(2,'Té Verde del Bosque de la Muerte','comida/Lun2.png','Una infusión intensa de matcha orgánico y hierbas silvestres. Energizante y purificante, ideal para sobrevivir a cualquier examen Chunin.'),
(3,'Chidori Fizz (Limonada Eléctrica)','comida/Mar1.png','Limonada artesanal con blue curacao y un toque de caramelo carbonatado que \'chisporrotea\' en tu boca como mil pájaros cantando.'),
(4,'Sharin-gan-dwich de Jamón','comida/Mar2.png','Sándwich circular de pan artesanal con jamón serrano y queso provolone. El diseño del Sharingan está hecho con tomates deshidratados y aceitunas negras.'),
(5,'Ramen Ichiraku-Gatuno Jr.','comida/Mie1.png','El clásico ramen de Miso favorito de Naruto, pero con un toque felino: narutomakis cortados con forma de gatito y un caldo cocinado por 12 horas.'),
(6,'Dango de la Hoja (3 colores)','comida/Mie2.png','Brochetas de mochi dulce (rosa, blanco y verde). Tan suaves que incluso Itachi Uchiha haría una pausa en su misión para disfrutarlos.'),
(7,'Amaterasu Black Latte','comida/Jue1.png','Café latte oscuro preparado con carbón activado y cacao amargo. Una bebida intensa cuyas sombras parecen arder eternamente in tu taza.'),
(8,'Miau-gekyu Sharingan Toast','comida/Jue2.png','Tostada de pan brioche con crema de avellanas y fresas frescas dispuestas en el complejo patrón del Mangekyō. Dulce, visual y poderosa.'),
(9,'Susanoo Soda (Mora Azul)','comida/Vie1.png','Soda de mora azul vibrante con esferas de nitrógeno que crean un aura mística alrededor del vaso. La defensa absoluta contra el calor.'),
(10,'Takoyaki \'Tentáculos de Killer Bee\'','comida/Vie2.png','Bolitas de pulpo fritas, sazonadas con salsa unagi y jengibre. Tan rítmicas y deliciosas que te harán querer rapear como el Jinchūriki del Ocho Colas.'),
(11,'Jutsu Fuerza de un Centenar (Atún)','comida/Sab1.png','Tataki de atún sellado a la perfección. La disposición de los cortes emula el sello Byakugou de Lady Tsunade. Fuerza y elegancia en cada bocado.'),
(12,'Onigiri Relleno Akatzu-ki','comida/Sab2.png','Onigiri envuelto en alga nori con una nube roja de paprika. Relleno de atún picante, representando la peligrosidad de la organización más buscada.'),
(13,'Bolla de Fuego Uchiha (Mochi de Fresa)','comida/Dom1.png','Mochis artesanales rellenos de helado de fresa. Su exterior es suave como una nube y su sabor es tan explosivo como un jutsu de fuego.'),
(14,'Café \'Sello Maldito\' (Cargado)','comida/Dom2.png','Espresso doble extra cargado. Su espuma lleva el diseño del sello de Orochimaru. Una dosis de energía oscura para despertar tus instintos.');
/*!40000 ALTER TABLE `platillos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-26 13:23:27
