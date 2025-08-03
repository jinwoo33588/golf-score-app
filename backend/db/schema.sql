-- backend/db/schema.sql

CREATE TABLE rounds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_name VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  weather VARCHAR(50) DEFAULT '-',
  FOREIGN KEY (user_id) REFERENCES users(id)
);


CREATE TABLE holes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  round_id INT NOT NULL,
  hole_number INT NOT NULL,      -- 1~18
  par INT NOT NULL,
  score INT DEFAULT NULL,
  putts INT DEFAULT NULL,
  gir BOOLEAN DEFAULT NULL,
  fw_hit BOOLEAN DEFAULT NULL,
  penalties INT DEFAULT 0,
  FOREIGN KEY (round_id) REFERENCES rounds(id)
);


CREATE TABLE shots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hole_id INT NOT NULL,
  shot_number INT NOT NULL,
  club VARCHAR(50) DEFAULT '-',
  start_location VARCHAR(50) DEFAULT '-',
  end_location VARCHAR(50) DEFAULT '-',
  distance INT DEFAULT NULL,
  result VARCHAR(255) DEFAULT '-',
  lie VARCHAR(50) DEFAULT '-',
  notes TEXT DEFAULT NULL,
  FOREIGN KEY (hole_id) REFERENCES holes(id)
);
