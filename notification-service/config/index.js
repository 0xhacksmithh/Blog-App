import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT;

const db_uri = process.env.DB_URI;

export { port, db_uri };
