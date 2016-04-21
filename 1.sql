ALTER TABLE usr
  ADD COLUMN code CHAR(4);

CREATE TABLE PROMOTION (
  id           INT AUTO_INCREMENT NOT NULL,
  name         VARCHAR(10),
  code         CHAR(4),
  created_time TIMESTAMP,
  PRIMARY KEY (id)
);