import express from "express"
const router = express.Router()

import Game from "../../models/game.js"
import isAuthenticated from "../../middleware/auth.js"
import attachUser from "../../middleware/attachUser.js"
import isStaff from "../../middleware/staff.js"

router.get("/", isAuthenticated, async (req, res) => {
	try {
		const games = await Game.find().exec()
		let temp = []
		for (let i = 0; i < games.length; i++) {
			temp[i] = { name: games[i].name, available: await games[i].available(), id: games[i].id }
		}
		res.send(temp)
	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}
})

router.post("/", isAuthenticated, attachUser(), isStaff, async (req, res) => {
	try {
		const game = await Game.create({
			name: req.body.name
		})
		res.json(game)
	} catch (err) {
		res.status(500).send(err)
	}
})

export default router
