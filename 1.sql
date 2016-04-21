alter table usr add column code char(4);

create table PROMOTION (
	id int auto_increment not null,
	name varchar(10),
	code char(4),
	primary key(id)
);