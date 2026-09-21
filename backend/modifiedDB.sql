CREATE TABLE users (
	user_id SERIAL PRIMARY KEY NOT NULL UNIQUE,
	first_name VARCHAR(100) NOT NULL,
	last_name VARCHAR(100) NOT NULL,
	email VARCHAR(100) NOT NULL UNIQUE,
	username VARCHAR(100) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL,
	role_name VARCHAR(100)
);

CREATE TABLE Vechicles (
	vechicle_id SERIAL PRIMARY KEY NOT NULL UNIQUE,
	car_brand VARCHAR(100) NOT NULL,
	car_model VARCHAR(100) NOT NULL,
	color VARCHAR(50) NOT NULL,
	license_plate VARCHAR(100) NOT NULL UNIQUE,
	province VARCHAR(100) NOT NULL,
	user_id INT not NULL,
	FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE wallets (
	wallet_id SERIAL PRIMARY KEY NOT NULL UNIQUE,
	balance INT NOT NULL,
	user_id INT NOT NULL,
	FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE Transactions (
	transaction_id SERIAL PRIMARY KEY NOT NULL UNIQUE,
	wallet_id INT NOT NULL,
	transaction_type VARCHAR(100) NOT NULL,
	amount INT NOT NULL,
	slip_ref VARCHAR(255),
	created_at TIMESTAMP,
	FOREIGN KEY(wallet_id) REFERENCES wallets(wallet_id)
	
);

CREATE TABLE parkingLots (
	parkingLot_id SERIAL PRIMARY KEY NOT NULL UNIQUE,
	latitude DECIMAL(8, 6),
	longitude DECIMAL(9, 6),
	parkingLot_name VARCHAR(255),
	price_per_hour INT,
	open_time TIMESTAMP,
	close_time TIMESTAMP
);

CREATE TABLE parkingSlots (
	parkingSlot_id SERIAL PRIMARY KEY NOT NULL UNIQUE,
	parkingSlot_name VARCHAR(255),
	parkingLot_id INT NOT NULL,
	status VARCHAR(50),
	FOREIGN KEY(parkingLot_id) REFERENCES parkingLots(parkingLot_id)
);

CREATE TABLE reservations (
	reservation_id SERIAL PRIMARY KEY NOT NULL UNIQUE,
	user_id INT,
	vechicle_id INT,
	parkingSlot_id INT,
	start_time TIMESTAMP,
	end_time TIMESTAMP,
	total_price FLOAT(2),
	advance_deposit FLOAT(2),
	created_at TIMESTAMP,
	FOREIGN KEY(user_id) REFERENCES users(user_id),
	FOREIGN KEY(vechicle_id) REFERENCES vechicles(vechicle_id),
	FOREIGN KEY(parkingSlot_id) REFERENCES parkingSlots(parkingSlot_id)
);

CREATE TABLE reservation_payments (
	payment_id SERIAL PRIMARY KEY NOT NULL UNIQUE,
	reservation_id INT,
	transaction_id INT,
	amount FLOAT(2),
	created_at TIMESTAMP,
	FOREIGN KEY(reservation_id) REFERENCES reservations(reservation_id),
	FOREIGN KEY(transaction_id) REFERENCES transactions(transaction_id)
);


CREATE TABLE check_in_outs (
	check_id SERIAL PRIMARY KEY NOT NULL UNIQUE,
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
    FOREIGN KEY (parkingLot_id) REFERENCES parkingLots(parkingLot_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);