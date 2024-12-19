DROP DATABASE IF EXISTS well_db;
CREATE DATABASE well_db;
USE well_db;

CREATE TABLE well (
  id int PRIMARY KEY AUTO_INCREMENT,
  x float,
  y float,
  depth int,
  debit int,
  status int,
  place int
);

CREATE TABLE place (
  id int PRIMARY KEY AUTO_INCREMENT,
  name varchar(255),
  area int
);

CREATE TABLE area (
  id integer PRIMARY KEY AUTO_INCREMENT,
  name varchar(255)
);

CREATE TABLE status (
  id integer PRIMARY KEY AUTO_INCREMENT,
  name varchar(255)
);

ALTER TABLE well ADD FOREIGN KEY (status) REFERENCES status (id);

ALTER TABLE well ADD FOREIGN KEY (place) REFERENCES place (id);

ALTER TABLE place ADD FOREIGN KEY (area) REFERENCES area (id);



INSERT INTO area (name) VALUES 
("Тверская область"),
("Московская область")
;
INSERT INTO status (name) VALUES 
("Песок"),
("Известняк")
;
INSERT INTO place (name, area) VALUES 
("Мильково",2),
("Дроздово",2),
("Рязаново",1),
("Заборье",1),
("Лопатино",2),
("Апаринки",2)
;
INSERT INTO well (x, y,depth,debit,status, place) VALUES 
("56.793366", "36.238685", "67", "4", 2, 4),
("56.700978", "35.757790", "54", "2",  2, 3),
("55.607402", "37.793921", "100", "5", 2, 1),
("55.604816", "37.801807", "103", "2", 2, 2),
("55.527133", "37.648531", "12", "1", 1 , 5),
("55.528431", "37.646401", "19", "4", 1 , 5),
("55.572353", "37.760620", "32", "2", 1, 6),
("55.570946", "37.759210", "92", "5", 2, 6)
;

SELECT well.x, well.y, well.depth AS `Глубина`,well.debit AS `Дебит`, place.name AS `Место`, area.name AS `Область` 
FROM well
JOIN place ON well.place = place.id
JOIN area ON place.area = area.id
JOIN status ON well.status = status.id
WHERE area.name = 'Московская область' AND well.debit > 3 AND status.name = 'Песок'
;

DELIMITER //
CREATE PROCEDURE GetWellByCriteria(IN area_name VARCHAR(100), IN min_debit INT, IN status_name VARCHAR(30))
BEGIN 
	SELECT well.x, well.y, well.depth AS `Глубина`,well.debit AS `Дебит`, place.name AS `Место`, area.name AS `Область` 
	FROM well
	JOIN place ON well.place = place.id
	JOIN area ON place.area = area.id
	JOIN status ON well.status = status.id
	WHERE area.name = area_name AND well.debit > min_debit AND status.name = status_name;
END;
//
DELIMITER ;

CALL GetWellByCriteria('Московская область', 3, 'Песок');