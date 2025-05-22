import { databases } from "./config";
import { db, commentCollection } from "../name"
import { Permission } from "appwrite"


export default async function createCommentCollection() {
    try {
        await databases.createCollection(db, commentCollection, "comments", [
            Permission.read("any"),
            Permission.read("users"),
            Permission.create("users"),
            Permission.update("users"),
            Permission.delete("users")
        ])
        console.log("Comment Collection Created Successfully")
        //attributes
        await Promise.all([
            databases.createStringAttribute(db, commentCollection, "content", 1000, true),
            databases.createEnumAttribute(db, commentCollection, "type", ["question", "answer"], true),
            databases.createStringAttribute(db, commentCollection, "author", 100, true),
            databases.createStringAttribute(db, commentCollection, "typeId", 50, true),
        ])
        console.log("Comment Attribute Created Successfully")


    } catch (error: any) {
        console.log(error.message)
    }
}
