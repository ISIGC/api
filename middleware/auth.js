import jwt from "jsonwebtoken"

export default async (req, res, next) => {
	const token = req.cookies.session || req.headers["x-access-token"]
	if (!token) {
		return res.status(401).send("No Authentication Token")
	}
	try {
		const decoded = await jwt.verify(token, process.env.TOKEN_SECRET)
		req.userId = decoded.id
		next()
	} catch (err) {
		return res.status(401).send("Invalid Token")
	}
}
