export default async (req, res, next) => {
	try {
		if (!(req.user.staff || req.user.admin)) {
			return res.status(401).send("Access Denied")
		}
		next()
	} catch (err) {
		return res.status(401).send("Invalid Token")
	}
}
