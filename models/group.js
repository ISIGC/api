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

groupSchema.virtual("popUsers").get(function () {
	return this.populate("users", "name room phone -_id").then((res) => res.users)
})

export default model("Group", groupSchema)
