ALTER TABLE app_users
ADD password_hash VARCHAR2(255);

UPDATE app_users
SET password_hash = '$2a$10$7EqJtq98hPqEX7fNZaFWoO5XvD9Y5lnnlyX8wKQ2q3FOjXK2g9kOm';

ALTER TABLE app_users
MODIFY password_hash VARCHAR2(255) NOT NULL;