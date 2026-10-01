-- W13 Accommodation Booking App — Azure SQL schema
-- Run this against your Azure SQL Database `bookingdb`
-- Compatible with Azure SQL (uses IDENTITY, NVARCHAR, DATETIME2)

IF OBJECT_ID('bookings', 'U') IS NOT NULL DROP TABLE bookings;
IF OBJECT_ID('rooms',   'U') IS NOT NULL DROP TABLE rooms;

CREATE TABLE rooms (
  id        INT             IDENTITY(1,1) PRIMARY KEY,
  name      NVARCHAR(100)   NOT NULL,
  type      NVARCHAR(100)   NOT NULL,
  price     DECIMAL(10, 2)  NOT NULL,
  created   DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE bookings (
  id           INT            IDENTITY(1,1) PRIMARY KEY,
  room_id      INT            NOT NULL,
  guest_name   NVARCHAR(200)  NOT NULL,
  check_in     DATETIME2      NOT NULL,
  check_out    DATETIME2      NOT NULL,
  created      DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT fk_bookings_room
    FOREIGN KEY (room_id) REFERENCES rooms(id)
    ON DELETE CASCADE
);

CREATE INDEX ix_bookings_check_in ON bookings (check_in);
