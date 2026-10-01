-- W13 Accommodation Booking App — seed data (run after schema.sql)
-- 5 sample rooms for a Bangkok hotel demo

INSERT INTO rooms (name, type, price) VALUES
  (N'ห้อง Deluxe 101', N'Deluxe', 2500.00),
  (N'ห้อง Deluxe 102', N'Deluxe', 2500.00),
  (N'ห้อง Suite 201',  N'Suite',  4500.00),
  (N'ห้อง Family 301', N'Family', 3800.00),
  (N'ห้อง Standard 401', N'Standard', 1800.00);
