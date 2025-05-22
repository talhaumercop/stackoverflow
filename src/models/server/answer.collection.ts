import { databases } from "./config";
import { db, answerCollection } from "../name";
import { Permission } from "appwrite";


export default async function createAnswerCollection() {
    try {
        await databases.createCollection(db, answerCollection, "answers",
            [
                Permission.read("any"),
                Permission.read("users"),
                Permission.create("users"),
                Permission.update("users"),
                Permission.delete("users")
            ]
        )
        console.log("Answer Collection Created Successfully")

        //attributes
        await Promise.all([
            databases.createStringAttribute(db, answerCollection, "content", 10000, true),
            databases.createStringAttribute(db, answerCollection, "questionId", 50, true),
            databases.createStringAttribute(db, answerCollection, "author", 100, true),
            databases.createStringAttribute(db, answerCollection, "attachmentId", 50, false)
        ])
        console.log("Answer Collection Attributes Created Successfully")
    } catch (error: any) {
        console.log(error.message)
    }
}