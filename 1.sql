ALTER TABLE usr
  ADD COLUMN code CHAR(4);

CREATE TABLE PROMOTION (
  id             INT AUTO_INCREMENT NOT NULL,
  name           VARCHAR(10),
  code           CHAR(4),
  mobile         CHAR(11),
  position       VARCHAR(20),
  created_time   TIMESTAMP,
  type           CHAR(4),
  promotion_code INT,
  valid          SMALLINT,
  PRIMARY KEY (id)
);
CREATE TABLE by_sequence (
  id INT AUTO_INCREMENT,
  PRIMARY KEY (id)
);