import mongoose from "mongoose"
const { Schema, model } = mongoose
import Rent from "./rent.js"

const gameSchema = new Schema(
	{
		name: { type: String, required: true, trim: true }
	},
	{
		timestamps: true,
		versionKey: false
	}
)

gameSchema.methods.available = async function () {
	try {
		if (await Rent.exists({ game: this.id })) {
			if (await Rent.exists({ game: this.id, returned: false })) {
				return false
			}
			return true
		}
		return true
	} catch (err) {
		console.log(err)
		return false
	}
}

// gameSchema.virtual("available").get(function () {
// 	let id = this.id
// 	let res = false
// 	Rent.exists({ game: id }, function (err, doc) {
// 		console.log(id)
// 		if (err) {
// 			console.log(err)
// 		} else {
// 			if (doc) {
// 				Rent.exists({ game: id, returned: false }, function (err, doc) {
// 					console.log(err)
// 					if (err) {
// 						res = false
// 					} else {
// 						if (doc) {
// 							res = false
// 						}
// 						res = true
// 					}
// 				})
// 			}
// 			res = true
// 		}
// 	})
// 	return res

// 	console.log(this.id)
// 	// if (Rent.exists({ game: this.id })) {
// 	// 	console.log("Atleast one rent occured")
// 	// 	if (Rent.exists({ game: this.id, returned: false })) {
// 	// 		return false
// 	// 	}
// 	// 	return true
// 	// }
// 	// return true

// 	Rent.findOne({ game: this.id }).then((res) => {
// 		console.log(this.id)
// 		console.log(res)
// 	})
// })

export default model("Game", gameSchema)
