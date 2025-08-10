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
  `id`              INT AUTO_INCREMENT PRIMARY KEY,
  `hole_id`         INT NOT NULL,
  `shot_number`     INT NOT NULL,
  `club`            VARCHAR(50) DEFAULT '-',
  `condition`       VARCHAR(50) NOT NULL,     -- 페어웨이/러프/벙커 등
  `remaining_dist`  INT     DEFAULT NULL,     -- 남은 거리
  `actual_dist`     INT     DEFAULT NULL,     -- 실제 친 거리
  `result`          VARCHAR(255) DEFAULT '-', -- 샷 결과
  `notes`           TEXT    DEFAULT NULL,     -- 메모
  FOREIGN KEY (`hole_id`) REFERENCES `holes`(`id`)
);

