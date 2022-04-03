import "dotenv/config"
import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.get("/games", (req, res) => {
	res.send("Hello World!")
})

mongoose.connect(
	`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_WORK}?authSource=${process.env.DB_AUTH}`,
	{ useNewUrlParser: true, useUnifiedTopology: true }
)

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", function () {
	console.log("DB ready to rock and roll!!!")
})

app.disable("x-powered-by")
app.use(express.json())
app.use(cookieParser())
app.use(
	cors({
		origin: [process.env.HOME_URL],
		credentials: true
	})
)

import gamesRouter from "./routes/game/index.js"
app.use("/game", gamesRouter)

import rentRouter from "./routes/rent/index.js"
app.use("/rent", rentRouter)

import userRouter from "./routes/user/index.js"
app.use("/user", userRouter)

import groupRouter from "./routes/group/index.js"
app.use("/group", groupRouter)

app.listen(process.env.PORT, () => {
	console.log(`IGC Website API listening on port ${process.env.PORT}`)
})
