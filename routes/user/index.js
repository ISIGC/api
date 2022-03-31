import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../../models/user.js"
import isAuthenticated from "../../middleware/auth.js"

const router = express.Router()

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
		const password = await bcrypt.hash(req.body.password, 8)
		await User.create({
			roll: req.body.roll,
			password: password,
			name: req.body.name,
			gender: req.body.gender,
			phone: req.body.phone
		})
		res.status(201).end()
	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}
})

router.post("/login", async (req, res) => {
	try {
		const user = await User.findOne({ roll: req.body.roll }).exec()
		if (user) {
			if (await bcrypt.compare(req.body.password, user.password)) {
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
			} else {
				return res.status(401).send({
					errors: {
						password: "Does Not Match"
					}
				})
			}
		} else {
			return res.status(401).send({
				errors: {
					email: "Does Not Exist"
				}
			})
		}
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

router.get("/logout", isAuthenticated, async (req, res) => {
	try {
		res.clearCookie("session")
		res.status(200).send()
	} catch (err) {
		res.status(500).send(err)
	}
})

export default router
