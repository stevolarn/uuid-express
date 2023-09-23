-- run individually

CREATE DATABASE json_data_db;

CREATE TABLE json_data_table(
	id UUID PRIMARY KEY,
	json_field JSONB NOT NULL
);
