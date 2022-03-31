import mongoose from "mongoose"
const { Schema, model } = mongoose

const groupSchema = new Schema(
	{
		name: { type: String, required: true, trim: true, unique: true },
		users: [{ type: Schema.Types.ObjectId, ref: "User" }]
	},
	{
		timestamps: true,
		versionKey: false
	}
)

export default model("Group", groupSchema)
