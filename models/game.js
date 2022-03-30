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

export default model("Game", gameSchema)
