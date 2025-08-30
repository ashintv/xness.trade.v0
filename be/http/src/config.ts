import dotenv from "dotenv";
dotenv.config();

// JWT Secret
export const JWT_SECRET = process.env.JWT_SECRET;

//Hyper Table Datbase

export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = process.env.DB_PORT;
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_NAME = process.env.DB_NAME;





// host: "localhost", 
// 	port: 5432, 
// 	user: "postgres", 
// 	password: "pass", 
// 	database: "xness",