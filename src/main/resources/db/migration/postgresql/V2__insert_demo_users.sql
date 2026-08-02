INSERT INTO app_users (
    username,
    full_name,
    email,
    password_hash,
    role,
    active
) VALUES (
    'rudra',
    'Rudra Pandey',
    'rudra@example.com',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoO5XvD9Y5lnnlyX8wKQ2q3FOjXK2g9kOm',
    'REPORTER',
    1
);

INSERT INTO app_users (
    username,
    full_name,
    email,
    password_hash,
    role,
    active
) VALUES (
    'support.agent',
    'Support Agent',
    'support@example.com',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoO5XvD9Y5lnnlyX8wKQ2q3FOjXK2g9kOm',
    'SUPPORT_AGENT',
    1
);

INSERT INTO app_users (
    username,
    full_name,
    email,
    password_hash,
    role,
    active
) VALUES (
    'service.manager',
    'Service Manager',
    'manager@example.com',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoO5XvD9Y5lnnlyX8wKQ2q3FOjXK2g9kOm',
    'MANAGER',
    1
);