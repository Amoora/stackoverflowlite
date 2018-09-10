DROP TABLE ANSWERS IF EXISTS:
DROP TABLE QUESTIONS IF EXISTS;
DROP TABLE USERS IF EXISTS;
CREATE TABLE USERS(
    id SERIAL UNIQUE,
    username VARCHAR(25) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    email VARCHAR (50) NOT NULL UNIQUE,
    date_joined timestamp default now()
);

CREATE TABLE QUESTIONS(
    id SERIAL UNIQUE,
    title varchar(70) NOT NULL,
    description TEXT NOT NULL,
    category varchar(25),
    createdby INT NOT NULL,
    FOREIGN KEY (createdby) REFERENCES USERS(id),
    date_created timestamp default  now() 
);

CREATE TABLE ANSWERS(
    id SERIAL UNIQUE,
    question_id int REFERENCES QUESTIONS(ID) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    userId INT,
    accepted boolean,
    primary key(id),
    FOREIGN KEY (question_id) REFERENCES QUESTIONS(ID),
    FOREIGN KEY (userId) REFERENCES USERS(ID),
    date_answered timestamp default now() 
);
