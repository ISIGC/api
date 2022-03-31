import mongoose from "mongoose"
const { Schema, model } = mongoose

const rentSchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: "User" },
		game: { type: Schema.Types.ObjectId, ref: "Game" },
		returned: { type: Boolean, required: true, default: false },
		returnedAt: { type: Date, default: null }
	},
	{
		timestamps: true,
		versionKey: false
	}
)

rentSchema.pre("validate", function (next) {
	if (this.returned === true) {
		this.returnedAt = new Date()
	}
	next()
})

export default model("Rent", rentSchema)
