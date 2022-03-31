import express from "express"
const router = express.Router()

import Rent from "../../models/rent.js"
import User from "../../models/user.js"

router.post("/:gameId", async (req, res) => {
	try {
		const user = await User.findOne({ roll: req.body.roll }).exec()
		if (user) {
			const doc = await Rent.exists({ game: req.params.gameId, returned: false }).exec()
			if (doc) {
				return res.status(404).json({ error: "Game not available" })
			}
			const rent = await Rent.create({
				user: user.id,
				game: req.params.gameId
			})
			return res.json(rent)
		}
		res.status(404).json({ error: "User does not exist" })
	} catch (err) {
		res.status(500).send(err)
	}
})

router.get("/:gameId/return", async (req, res) => {
	try {
		const doc = await Rent.findOne({ game: req.params.gameId, returned: false }).exec()
		if (doc) {
			console.log(doc)
			doc.returned = true
			await doc.save()
			return res.json(doc)
		}
		res.status(500).json({ error: "Game already returned" })
	} catch (err) {
		res.status(500).send(err)
	}
})

export default router
