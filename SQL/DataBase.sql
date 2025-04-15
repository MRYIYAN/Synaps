-- Base global de usuarios
CREATE DATABASE IF NOT EXISTS synaps;
USE synaps;

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id2 VARCHAR(32) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS shared_notes (
  note_id INT AUTO_INCREMENT PRIMARY KEY,
  shared_owner_id INT NOT NULL,
  shared_user_id INT NOT NULL,
  shared_user_roles TINYINT NOT NULL
);

-- Base de cliente 0001
CREATE DATABASE IF NOT EXISTS synaps_0001;
USE synaps_0001;

CREATE TABLE IF NOT EXISTS notes (
  note_id INT AUTO_INCREMENT PRIMARY KEY,
  note_id2 VARCHAR(32) NOT NULL,
  note_title VARCHAR(255) NOT NULL,
  insert_date DATETIME NOT NULL
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
