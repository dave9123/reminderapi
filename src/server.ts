import Fastify from "fastify";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 3000;
const app = Fastify();

app.listen({ port: parseInt(process.env.PORT) || 3000, host: "0.0.0.0"}, err => {
    if (err) throw err;
    app.log.info(`Listening on ${app.server.address()}`);
})