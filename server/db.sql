CREATE DATABASE IF NOT EXISTS classroom_announcement_system;
USE classroom_announcement_system;

CREATE TABLE IF NOT EXISTS topics (
  topic_id INT AUTO_INCREMENT PRIMARY KEY,
  topic_name VARCHAR(255) NOT NULL,
  parent_topic_id INT NULL,
  FOREIGN KEY (parent_topic_id) REFERENCES topics(topic_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS buildings (
  building_id INT AUTO_INCREMENT PRIMARY KEY,
  building_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS rooms (
  room_id INT AUTO_INCREMENT PRIMARY KEY,
  room_name VARCHAR(255) NOT NULL,
  building_id INT NOT NULL,
  FOREIGN KEY (building_id) REFERENCES buildings(building_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS announcements (
  announcement_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  start_date DATETIME NULL,
  end_date DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS announcement_topics (
  announcement_id INT NOT NULL,
  topic_id INT NOT NULL,
  PRIMARY KEY (announcement_id, topic_id),
  FOREIGN KEY (announcement_id) REFERENCES announcements(announcement_id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(topic_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS announcement_rooms (
  announcement_id INT NOT NULL,
  room_id INT NOT NULL,
  PRIMARY KEY (announcement_id, room_id),
  FOREIGN KEY (announcement_id) REFERENCES announcements(announcement_id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);
