import mongoose from "mongoose"
const { Schema, model } = mongoose
import Group from "./group.js"

const userSchema = new Schema(
	{
		roll: {
			type: String,
			required: true,
			trim: true,
			lowerCase: true,
			unique: true
		},
		password: { type: String, required: true },
		name: {
			type: String,
			required: true,
			trim: true
		},
		gender: {
			type: String,
			required: true,
			lowerCase: true,
			trim: true
		},
		room: {
			type: String,
			required: true,
			trim: true
		},
		phone: {
			type: String,
			required: true,
			trim: true
		},
		active: { type: Boolean, required: true, default: false }
	},
	{
		timestamps: true,
		versionKey: false
	}
)

userSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
	await this.removeFromGroups()
	next()
})

userSchema.methods.inGroup = async function (name) {
	try {
		const group = await Group.findOne({ name: name }).exec()
		if (group) {
			return group.users.indexOf(this.id) !== -1 ? true : false
		} else {
			return undefined
		}
	} catch (err) {
		return err
	}
}

userSchema.methods.groups = async function () {
	try {
		const groups = await Group.find({ users: this.id }, "+name").exec()
		let leanGroups = []
		for (let i = 0; i < groups.length; i++) {
			leanGroups[i] = groups[i].name
		}
		return leanGroups
	} catch (err) {
		return err
	}
}

userSchema.methods.addToGroups = async function (names = [], upsert = true) {
	try {
		Group.updateMany(
			names[0] ? { name: { $in: names } } : {},
			{ $addToSet: { users: this.id } },
			{ upsert: upsert }
		).exec()
		return true
	} catch (err) {
		return err
	}
}

userSchema.methods.removeFromGroups = async function (names = [], upsert = true) {
	try {
		Group.updateMany(names[0] ? { name: { $in: names } } : {}, { $pull: { users: this.id } }, { upsert: upsert }).exec()
		return true
	} catch (err) {
		return err
	}
}

userSchema.virtual("firstName").get(function () {
	return this.name.split(" ")[0]
})

userSchema.virtual("lastName").get(function () {
	const splitName = this.name.split(" ")
	return splitName[splitName.length - 1]
})

userSchema
	.virtual("staff")
	.get(function () {
		return this.inGroup("staff")
	})
	.set(function (v) {
		if (v) {
			this.addToGroups(["staff"])
		} else {
			this.removeFromGroups(["staff"])
		}
	})

userSchema
	.virtual("admin")
	.get(function () {
		return this.inGroup("admin")
	})
	.set(function (v) {
		if (v) {
			this.addToGroups(["admin"])
		} else {
			this.removeFromGroups(["admin"])
		}
	})

export default model("User", userSchema)
