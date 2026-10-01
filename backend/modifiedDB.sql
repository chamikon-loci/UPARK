CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    role_name VARCHAR(100) NOT NULL DEFAULT 'Customer'
);

CREATE TABLE vechicles (
    vechicle_id SERIAL PRIMARY KEY,
    car_brand VARCHAR(100) NOT NULL,
    car_model VARCHAR(100) NOT NULL,
    color VARCHAR(50) NOT NULL,
    license_plate VARCHAR(100) NOT NULL UNIQUE,
    province VARCHAR(100) NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE wallets (
    wallet_id SERIAL PRIMARY KEY,
    balance INT NOT NULL DEFAULT 0,
    user_id INT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    wallet_id INT NOT NULL,
    transaction_type VARCHAR(100) NOT NULL,
    amount INT NOT NULL,
    slip_ref VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(wallet_id) REFERENCES wallets(wallet_id)
);

CREATE TABLE parkingLots (
    parkingLot_id SERIAL PRIMARY KEY,
    latitude DECIMAL(8, 6),
    longitude DECIMAL(9, 6),
    parkingLot_name VARCHAR(255),
    price_per_hour INT,
    open_time TIMESTAMP,
    close_time TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'Open'
);

CREATE TABLE parkingSlots (
    parkingSlot_id SERIAL PRIMARY KEY,
    parkingSlot_name VARCHAR(255),
    parkingLot_id INT NOT NULL,
    status VARCHAR(50),
    FOREIGN KEY(parkingLot_id) REFERENCES parkingLots(parkingLot_id)
);

CREATE TABLE reservations (
    reservation_id SERIAL PRIMARY KEY,
    user_id INT,
    vechicle_id INT,
    parkingSlot_id INT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    total_price FLOAT(2),
    advance_deposit FLOAT(2),
    pin_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(vechicle_id) REFERENCES vechicles(vechicle_id),
    FOREIGN KEY(parkingSlot_id) REFERENCES parkingSlots(parkingSlot_id)
);

CREATE TABLE check_in_outs (
    check_in_out_id SERIAL PRIMARY KEY,
    reservation_id INT,
    check_in_status VARCHAR(100),
    check_out_status VARCHAR(100),
    check_in_at TIMESTAMP,
    check_out_at TIMESTAMP,
    FOREIGN KEY(reservation_id) REFERENCES reservations(reservation_id)
);

CREATE TABLE parkingLotStaff (
    parkingLotStaff_id SERIAL PRIMARY KEY,
    parkingLot_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY(parkingLot_id) REFERENCES parkingLots(parkingLot_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE parkingLotManagers (
    parkingLotManager_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    parkingLot_id INT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(parkingLot_id) REFERENCES parkingLots(parkingLot_id)
);

CREATE TABLE queues (
    queue_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    vechicle_id INT NOT NULL,
    parkingLot_id INT NOT NULL,
    queue_number INT NOT NULL,
    advance_deposit FLOAT(2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(vechicle_id) REFERENCES vechicles(vechicle_id),
    FOREIGN KEY(parkingLot_id) REFERENCES parkingLots(parkingLot_id)
);

CREATE TABLE ratings (
    rating_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    reservation_id INT NOT NULL,
    score INT NOT NULL CHECK (score BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(reservation_id) REFERENCES reservations(reservation_id)
);