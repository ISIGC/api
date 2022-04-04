import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../../models/user.js"
import Group from "../../models/group.js"
import isAuthenticated from "../../middleware/auth.js"
import attachUser from "../../middleware/attachUser.js"
import isAdmin from "../../middleware/admin.js"

const router = express.Router()

router.post("/login", async (req, res) => {
	try {
		const user = await User.findOne({ roll: req.body.roll }).exec()
		if (user) {
			if (await bcrypt.compare(req.body.password, user.password)) {
				if (user.active) {
					const token = await jwt.sign(
						{
							id: user.id
						},
						process.env.TOKEN_SECRET,
						{
							expiresIn: "90d"
						}
					)
					res.cookie("session", token, {
						httpOnly: true,
						maxAge: 90 * 24 * 60 * 60 * 1000,
						sameSite: "none",
						secure: true
					})
					return res.status(200).end()
				}
				return res.status(401).json({ error: "user inactive" })
			}
			return res.status(401).json({ error: "incorrect passoword" })
		}
		return res.status(400).send({
			error: "user does not exist"
		})
	} catch (err) {
		res.status(500).send(err)
	}
})

router.get("/authCheck", async (req, res) => {
	const token = req.cookies.session || req.headers["x-access-token"]
	if (!token) {
		return res.status(401).send("No Authentication Token")
	}
	try {
		const decoded = await jwt.verify(token, process.env.TOKEN_SECRET)
		const user = await User.findById(decoded.id)
		if (user) {
			return res.status(200).send({ name: user.name, groups: await user.groups() })
		}
		return res.status(404).send("User does not Exist")
	} catch (err) {
		return res.status(401).send("Invalid Token")
	}
})

router.get("/staff", async (req, res) => {
	try {
		const users = await Group.aggregate([
			{ $match: { name: { $in: ["staff", "admin"] } } },
			{
				$group: {
					_id: 0,
					users: { $push: "$users" }
				}
			},
			{
				$project: {
					users: {
						$reduce: {
							input: "$users",
							initialValue: [],
							in: { $setUnion: ["$$value", "$$this"] }
						}
					}
				}
			}
		]).exec()
		console.log(users[0])
		const popUsersQuery = await User.populate(users[0], { path: "users", select: "name roll room -_id" })
		const popUsers = popUsersQuery.users
		return res.status(200).json(popUsers)
	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}
})

router.get("/admin", async (req, res) => {
	try {
		const group = await Group.findOne({ name: "admin" }).exec()
		return res.status(200).json(await group.popUsers)
	} catch (err) {
		res.status(500).send(err)
	}
})

router.get("/logout", isAuthenticated, async (req, res) => {
	try {
		res.clearCookie("session")
		res.status(200).send()
	} catch (err) {
		res.status(500).send(err)
	}
})

router.get("/:roll", isAuthenticated, attachUser(), isAdmin, async (req, res) => {
	try {
		let user = await User.findOne({ roll: req.params.roll }).exec()
		user = {
			id: user.id,
			name: user.name,
			roll: user.roll,
			room: user.room,
			gender: user.gender,
			active: user.active,
			groups: await user.groups()
		}
		res.send(user)
	} catch (err) {
		res.status(500).send(err)
	}
})

router.patch("/:roll", isAuthenticated, attachUser(), isAdmin, async (req, res) => {
	try {
		let change = {}
		if (req.body.active !== null) {
			change.active = req.body.active
		}
		await User.findOneAndUpdate({ roll: req.params.roll }, change).exec()
		res.status(200).end()
	} catch (err) {
		res.status(500).send(err)
	}
})

router.get("/", isAuthenticated, attachUser(), isAdmin, async (req, res) => {
	try {
		const users = await User.find({}, "name roll room active -_id").exec()
		res.send(users)
	} catch (err) {
		res.status(500).send(err)
	}
})

router.post("/", async (req, res) => {
	try {
		const password = await bcrypt.hash(req.body.password, 8)
		await User.create({
			roll: req.body.roll,
			password: password,
			name: req.body.name,
			room: req.body.room,
			gender: req.body.gender,
			phone: req.body.phone
		})
		res.status(201).end()
	} catch (err) {
		if (err.code === 11000) {
			return res.status(400).json({ error: "duplicate user" })
		}
		res.status(500).send(err)
	}
})

export default router
