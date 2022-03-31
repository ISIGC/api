import express from "express"
const router = express.Router()

import Rent from "../../models/rent.js"
import isAuthenticated from "../../middleware/auth.js"

router.post("/:gameId", isAuthenticated, async (req, res) => {
	try {
		if (req.userId) {
			const doc = await Rent.exists({ game: req.params.gameId, returned: false }).exec()
			if (doc) {
				return res.status(404).json({ error: "Game not available" })
			}
			const rent = await Rent.create({
				user: req.userId,
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
