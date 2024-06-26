CREATE DATABASE IF NOT EXISTS users_db;
USE users_db;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
);

INSERT INTO usuarios (nombre, contrasena, email) 
VALUES 
    ('Usuario1', '123', 'usuario1@example.com'),
    ('Usuario2', '123', 'usuario2@example.com');
