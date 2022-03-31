import User from "../models/user"

export default (select = "") =>
	async (req, res, next) => {
		try {
			let query = User.findById(req.userId)
			if (select) {
				query = query.select(select)
			}
			req.user = await query.exec()
			next()
		} catch (err) {
			return res.status(401).send("User Not Found")
		}
	}
