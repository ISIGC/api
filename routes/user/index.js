import express from "express"
const router = express.Router()

import User from "../../models/user.js"

router.get("/", async (req, res) => {
	try {
		const users = await User.find().exec()
		res.send(users)
	} catch (err) {
		res.status(500).send(err)
	}
})

router.post("/", async (req, res) => {
	try {
		const user = await User.create({
			roll: req.body.roll,
			name: req.body.name,
			gender: req.body.gender,
			phone: req.body.phone
		})
		res.json(user)
	} catch (err) {
		res.status(500).send(err)
	}
})

export default router
