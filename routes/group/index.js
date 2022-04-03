import express from "express"
import Group from "../../models/group.js"
import isAuthenticated from "../../middleware/auth.js"
import attachUser from "../../middleware/attachUser.js"
import isAdmin from "../../middleware/admin.js"

const router = express.Router()

router.post("/staff", isAuthenticated, attachUser(), isAdmin, async (req, res) => {
	try {
		if (req.body.users.constructor === String) {
			req.body.users = [req.body.users]
		}
		const staff = await Group.findOneAndUpdate(
			{ name: "staff" },
			{ $addToSet: { users: { $each: req.body.users } } },
			{ upsert: true }
		).exec()
		return res.status(200).end()
	} catch (err) {
		if (err.name === "CastError") {
			return res.status(400).send({ error: "invalid user id" })
		}
		res.status(500).send(err)
	}
})

export default router
