-- Name: GROUP-25 Aishwarya Manicka Ravichandran and Amy Robertson
-- Description: Data Definition queries for tourism database

SET FOREIGN_KEY_CHECKS = 0; 
DROP TABLE IF EXISTS `payment`;
DROP TABLE IF EXISTS `ratings`;
DROP TABLE IF EXISTS `assignment`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `tour_guide`;
DROP TABLE IF EXISTS `travel_location`;
DROP TABLE IF EXISTS `customers`;
SET FOREIGN_KEY_CHECKS = 1;
--
-- Table Structure for `customers`
-- 
CREATE TABLE `customers`
(
    `customer_ID` int(11) NOT NULL AUTO_INCREMENT,
    `first_name` varchar(255) NOT NULL,
    `middle_name` varchar(255) DEFAULT NULL,
    `last_name` varchar(255) NOT NULL,
    `street_no` int(11) NOT NULL,
    `city` varchar(255) NOT NULL,
    `state` varchar(255) NOT NULL,
    `country` varchar(255) NOT NULL,
    `postal_code` varchar(5) NOT NULL,
    `phone_number` varchar(12) NOT NULL,
    `email_id` varchar(255) NOT NULL,
    `passport_number` varchar(10) NOT NULL,
    `passport_countryofissue` varchar(255) NOT NULL,
    `passport_expirydate` DATE NOT NULL,
    PRIMARY KEY (`customer_ID`)

)ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
--
-- Inserting values into `customers`
--
INSERT INTO `customers` VALUES
(1, 'Kenny', NULL, 'Sebastian', '22','Seattle', 'Washington', 'USA', '98101', '111-222-3333', 'fakemail@random.com',
'O902323', 'USA', '2019-07-02'),
(2, 'Judith', NULL, 'Aniston', '48','Las Vegas', 'California', 'USA', '98901', '222-222-3333', 'judith@random.com',
'J682423', 'USA', '2029-07-02');
--
-- Table structure for `travel_location`
--
CREATE TABLE `travel_location`
 (
    `travelLocation_ID` int(11) NOT NULL AUTO_INCREMENT,
    `city` varchar(255) NOT NULL, 
    `country` varchar(255) NOT NULL, 
    `amount_perAdult` decimal(8,2) NOT NULL,
    `amount_perChild` decimal(8,2) NOT NULL,
    CONSTRAINT `location` UNIQUE (`city`, `country`),
    PRIMARY KEY (`travelLocation_ID`)

)ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
--
-- Inserting values into `travel_location`
--
INSERT INTO `travel_location` VALUES
(1, 'Paris', 'France', 100, 50),
(2, 'Bangkok', 'Thailand', 200, 150),
(3, 'Las Vegas', 'USA', 300, 250),
(4, 'Hawaii', 'USA', 200, 150),
(5, 'Melbourne', 'Australia', 150, 200),
(6, 'Rome', 'Italy', 800, 700),
(7, 'Edinburgh', 'Scotland', 900, 500),
(8, 'Venice', 'Italy', 900, 450),
(9, 'Seattle', 'USA', 500, 300),
(10, 'Portland', 'USA', 200, 100);
--
-- Table Structure for `bookings`
--
CREATE TABLE `bookings`
(
    `booking_ID` int(11) NOT NULL AUTO_INCREMENT,
    `booking_date` DATE NOT NULL,
    `departure_date` DATE NOT NULL,
    `arrival_date` DATE NOT NULL,
    `number_adults` int(11) NOT NULL,
    `number_children` int(11) DEFAULT NULL,
    `travelLocation_ID` int(11) NOT NULL DEFAULT '0',
    `customer_ID` int(11) NOT NULL DEFAULT '0',
    PRIMARY KEY (`booking_ID`)
)ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
--
-- Inserting values into `bookings`
--
INSERT INTO `bookings` VALUES
(1, '2019-12-12', '2020-05-01', '2020-05-10', 2, 0, 1, 2),
(2, '2019-05-12', '2020-05-02', '2020-05-14', 4, 1, 2, 1);
--
-- Table structure for `tour_guide`
--
CREATE TABLE `tour_guide` 
(
    `tourGuide_ID` int(11) NOT NULL AUTO_INCREMENT,
    `first_Name` varchar(255) NOT NULL, 
    `last_Name` varchar(255) NOT NULL, 
    CONSTRAINT `full_name` UNIQUE (`first_Name`, `last_Name`),
    PRIMARY KEY (tourGuide_ID)
)ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
--
-- Inserting values into `tour_guide`
--
INSERT INTO `tour_guide` VALUES
(1, 'Abe', 'Epstein'),
(2, 'Ross', 'Geller-Jones'),
(3, 'Joey', 'Tribbiani'),
(4, 'Chandler', 'Bing'),
(5, 'Elizabeth', 'Taylor'),
(6, 'Bob', 'Dylan');
--
-- Table Structure for `assignment`
--
CREATE TABLE `assignment`
(
    `tourGuide_travelLocation` int(11) NOT NULL AUTO_INCREMENT,
    `booking_ID` int(11) NOT NULL,	
    `travelLocation_ID` int(11) NOT NULL, 
    `tourGuide_ID` int(11) , 
    PRIMARY KEY (`tourGuide_travelLocation`)
)ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
--
-- Inserting values for `assignment`
--
INSERT INTO `assignment` VALUES
(1, 2, 1, 2),
(2, 1, 2, 5);
--
-- Table Structure for `payment`
--
CREATE TABLE `payment`
(
	`payment_ID` int(11) NOT NULL AUTO_INCREMENT,
	`booking_ID` int(11) NOT NULL DEFAULT '0',
	`payment_amount` Decimal(9,2) NOT NULL,
	`payment_date` DATE NOT NULL,
	`payment_description` varchar(255) NOT NULL,
	PRIMARY KEY (`payment_ID`)
)ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
--
-- Inserting values into `payment`
--
INSERT INTO `payment` VALUES
(1, 1, 1800, '2019-12-07', 'Payment for Paris tour');
--
-- Table structure for `ratings`
--
CREATE TABLE `ratings`
(
	`rating_ID` int(11) NOT NULL AUTO_INCREMENT,
	`travelLocation_ID` int(11) NOT NULL DEFAULT '0',
	`customer_ID` int(11) NOT NULL DEFAULT '0',
	`rating` int(11) NOT NULL,
	`review` varchar(255) NOT NULL,
	PRIMARY KEY (`rating_ID`)
)ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
--
-- Inserting values into `ratings`
--
INSERT INTO `ratings` VALUES
(1, 1, 1, 5, 'Excellent'),
(2, 2, 2, 4, 'Good');
--
-- Adding foreign keys
--
ALTER TABLE `bookings`
    ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`travelLocation_ID`) REFERENCES `travel_location`(`travelLocation_ID`) ON DELETE CASCADE,
    ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`customer_ID`) REFERENCES `customers`(`customer_ID`) ON DELETE CASCADE;

ALTER TABLE `assignment`
    ADD CONSTRAINT `assignment_ibfk_1` FOREIGN KEY (`booking_ID`) REFERENCES `bookings`(`booking_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `assignment_ibfk_2` FOREIGN KEY (`travelLocation_ID`) REFERENCES `travel_location`(`travelLocation_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `assignment_ibfk_3` FOREIGN KEY (`tourGuide_ID`) REFERENCES `tour_guide`(`tourGuide_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `uniquebooking` UNIQUE (`booking_ID`);

ALTER TABLE `payment`
    ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`booking_ID`) REFERENCES `bookings`(`booking_ID`) ON DELETE CASCADE;

ALTER TABLE `ratings`
    ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`travelLocation_ID`) REFERENCES `travel_location`(`travelLocation_ID`),
    ADD CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`customer_ID`) REFERENCES `customers`(`customer_ID`);