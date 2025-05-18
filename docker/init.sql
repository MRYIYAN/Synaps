-- Crear base de usuarios
CREATE DATABASE IF NOT EXISTS synaps;

USE synaps;

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id2 VARCHAR(32) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_password VARCHAR(255) NOT NULL
);

-- Crear usuario de prueba (contraseña: 123456)
INSERT INTO users (user_id2, user_email, user_name, user_password)
VALUES (
  'abc123',
  'test@example.com',
  'Usuario de prueba',
  '$2y$12$423rSF4V2fqyddNr6AuCUeM1BiuIifLAEldi49Wr9tEwG5kX0azb.'
);

-- Crear base por cliente
CREATE DATABASE IF NOT EXISTS synaps_0001;

USE synaps_0001;

CREATE TABLE IF NOT EXISTS notes (
  note_id INT AUTO_INCREMENT PRIMARY KEY,
  note_id2 VARCHAR(32) NOT NULL,
  parent_id INT NOT NULL,
  note_title VARCHAR(255) NOT NULL,
  insert_date DATETIME NOT NULL,
  last_update_date DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS docs (
  doc_id INT AUTO_INCREMENT PRIMARY KEY,
  doc_id2 VARCHAR(32) NOT NULL,
  doc_name VARCHAR(255) NOT NULL,
  insert_date DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  notification_id2 VARCHAR(32) NOT NULL,
  notification_message TEXT NOT NULL,
  insert_date DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS log (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  log_id2 VARCHAR(32) NOT NULL,
  log_message VARCHAR(255) NOT NULL,
  insert_date DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS folders_notes (
  folder_id INT AUTO_INCREMENT PRIMARY KEY,
  folder_id2 VARCHAR(32) NOT NULL,
  folder_title VARCHAR(255) NOT NULL,
  parent_id INT NOT NULL,
  children_count INT NOT NULL
);

-- NUEVA TABLA VAULTS
CREATE TABLE IF NOT EXISTS vaults (
  vault_id INT AUTO_INCREMENT PRIMARY KEY,
  vault_id2 CHAR(50) NOT NULL,
  vault_title VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  logical_path VARCHAR(255) NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
