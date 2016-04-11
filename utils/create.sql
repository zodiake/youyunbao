drop database zh;

create database zh;

use zh;

create table usr(
    id int auto_increment,
    name char(11),
    password char(64),
    authority varchar(20),
    activate smallint,
    primary key(id)
)CHARACTER SET utf8;

create table usr_detail(
    id int,
    detail_name varchar(10),
    gender char(1),
    identified_number char(18),
    company_name1 varchar(50),
    company_name2 varchar(50),
    company_name3 varchar(50),
    created_time timestamp,
    praise int default 0,
    portrait char(52),
    primary key(id),
    foreign key(id) references usr(id)
)CHARACTER SET utf8;

create table cargoo_name(
    id int auto_increment,
    name varchar(15),
    parent_id int,
    activate smallint,
    primary key(id),
    foreign key(parent_id) references cargoo_name(id)
)CHARACTER SET utf8;

create table common_consignee(
    id int auto_increment,
    consignee_id int,
    consignor_id int,
    foreign key(consignee_id) references usr(id),
    foreign key(consignor_id) references usr(id),
    primary key(id)
)CHARACTER SET utf8;

create table orders(
    id int auto_increment,
    order_number char(12),
    license varchar(24),
    consignor char(11),
    consignee char(11),
    consignee_name varchar(20),
    company_name varchar(60),
    category int,
    cargoo_name int,
    origin varchar(100),
    destination varchar(100),
    quantity double,
    actual_weight double,
    current_state varchar(10),
    created_time timestamp,
    etd timestamp null,
    type char(4),
    mobile char(11),
    app_or_out smallint default 1,
    primary key(id),
    foreign key(category) references cargoo_name(id),
    foreign key(cargoo_name) references cargoo_name(id)
)CHARACTER SET utf8;

create table order_gis(
    id bigint auto_increment,
    order_id int,
    longitude varchar(11),
    latitude varchar(11),
    created_time timestamp,
    primary key(id),
    foreign key(order_id) references orders(id)
)CHARACTER SET utf8;

create table order_state(
    order_state_id bigint auto_increment,
    order_id int,
    state_name varchar(10),
    img_url char(52),
    refuse_reason varchar(11) ,
    refuse_desc varchar(200),
    created_time timestamp,
    updated_by varchar(20),
    primary key(order_state_id),
    foreign key(order_id) references orders(id)
)CHARACTER SET utf8;

create table reviews(
    reviews_id int auto_increment,
    consignor_id int,
    description varchar(420),
    order_id int,
    level smallint,
    primary key(reviews_id),
    foreign key(consignor_id) references usr(id),
    foreign key(order_id) references orders(id)
)CHARACTER SET utf8;

create table suggestion(
    id int auto_increment,
    description varchar(600),
    created_time timestamp,
    mobile char(11),
    state smallint,
    primary key(id)
)CHARACTER SET utf8;

create table vehicle(
    id int auto_increment,
    license varchar(15),
    vehicle_type varchar(10),
    vehicle_length varchar(10),
    vehicle_weight varchar(10),
    usr_id int,
    foreign key(usr_id) references usr(id),
    primary key(id)
)CHARACTER SET utf8;

create table scroll_image(
    id int auto_increment,
    image_url char(50),
    image_href varchar(20),
    updated_time timestamp,
    primary key(id)
)CHARACTER SET utf8;

create table advertise(
    id int auto_increment,
    title varchar(20),
    content varchar(4000),
    primary key(id)
)CHARACTER set utf8; 

create table question(
    id int auto_increment,
    question varchar(100),
    answer varchar(1000),
    activate smallint default 1,
    primary key(id)
)CHARACTER set utf8;

create table app_version(
    id int auto_increment,
    version double,
    apple varchar(100),
    android varchar(100),
    primary key(id)
)CHARACTER set utf8;

/*test usr*/
insert into usr(id,name,password,authority,activate) values(1,'tom','202cb962ac59075b964b07152d234b70','ROLE_CONSIGNEE',1);
insert into usr(id,name,password,authority,activate) values(2,'peter','202cb962ac59075b964b07152d234b70','ROLE_CONSIGNOR',1);
insert into usr(id,name,password,authority,activate) values(3,'admin','202cb962ac59075b964b07152d234b70','ROLE_ADMIN',1);
insert into usr(id,name,password,authority,activate) values(4,'mary','202cb962ac59075b964b07152d234b70','ROLE_CONSIGNEE',1);

/*test user detail*/    
insert into usr_detail(id,detail_name,gender,company_name1,company_name2,company_name3) values(1,'tomeii','f','company1','company2','company3'); 
insert into usr_detail(id,detail_name,gender,company_name1,company_name2,company_name3) values(2,'peter lei','m','company1','company2','company3');
insert into usr_detail(id,detail_name,gender,company_name1,company_name2,company_name3) values(4,'mary lei','f','company1','company2','company3');

/*test category*/
insert into cargoo_name(id,name,activate) values(1,'汽油',1);
insert into cargoo_name(id,name,activate) values(2,'菜油',1);
insert into cargoo_name(id,name,activate) values(3,'化工品',1);
insert into cargoo_name(id,name,activate) values(4,'其他',1);
insert into cargoo_name(id,name,parent_id,activate) values(5,'secondCategory1',1,1);
insert into cargoo_name(id,name,parent_id,activate) values(6,'secondCategory2',2,1);
insert into cargoo_name(id,name,parent_id,activate) values(7,'secondCategory3',3,1);
insert into cargoo_name(id,name,parent_id,activate) values(8,'secondCategory4',4,1);

/*test orders*/
insert into orders(id,license,consignor,consignee,consignee_name,company_name,cargoo_name,current_state,order_number,category) values(1,'沪A-123456','peter','tom','tom','haha',2,'待分配','aabbcc','1');
insert into orders(id,license,consignor,consignee,consignee_name,company_name,cargoo_name,current_state,order_number,category) values(2,'沪A-123456','peter','tom','tom','haha',2,'待确认','aabbcc','1');
insert into orders(id,license,consignor,consignee,consignee_name,company_name,cargoo_name,current_state,order_number,category) values(3,'沪A-123456','peter','tom','tom','haha',5,'运送中','aabbcc','4');
insert into orders(id,license,consignor,consignee,consignee_name,company_name,cargoo_name,current_state,order_number,category) values(4,'沪A-123456','peter','tom','tom','haha',5,'已送达','aabbcc','4');

/*test orders state*/    
insert into order_state(order_id,state_name,created_time) values(1,'待分配','2013-1-1 12:13:14');
insert into order_state(order_id,state_name,created_time) values(1,'待确认','2013-1-1 12:13:14');
insert into order_state(order_id,state_name,created_time) values(1,'运送中','2013-1-1 12:13:14');
insert into order_state(order_id,state_name,created_time) values(1,'已送达','2013-1-1 12:13:14');

/*test scrollimage*/
insert into scroll_image(id,image_url,image_href) values(1,'/uploads/banner.png','');
insert into scroll_image(id,image_url,image_href) values(2,'/uploads/banner.png','');
insert into scroll_image(id,image_url,image_href) values(3,'/uploads/banner.png','');
insert into scroll_image(id,image_url,image_href) values(4,'/uploads/banner.png','');

CREATE INDEX order_id_index ON orders(order_number);
create index order_consignee_index on orders(consignee);
create index order_consignor_index on orders(consignor);