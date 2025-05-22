import { databases } from "./config"
import { db, questionCollection } from "../name"
import { Permission} from "appwrite"
import { IndexType } from "node-appwrite"



export default async function createQuestionCollection() {
    try {
        await databases.createCollection(db, questionCollection, "Question Collection",
            [
                Permission.read("any"),
                Permission.create("users"),
                Permission.read("users"),
                Permission.update("users"),
                Permission.delete("users")
            ])
        console.log("Question Collection Created Successfully")
        //attributes
        await Promise.all([
            databases.createStringAttribute(db, questionCollection, "title", 100, true),
            databases.createStringAttribute(db, questionCollection, "content", 1000, true),
            databases.createStringAttribute(db, questionCollection, "author", 100, true),
            databases.createStringAttribute(db, questionCollection, "tags", 100, true, undefined, true),
            databases.createStringAttribute(db, questionCollection, "attachmentId", 50, false)
        ])
        console.log("Question Collection Attributes Created Successfully")
        //indexes
        await Promise.all([
            databases.createIndex(db, questionCollection, "title_index", IndexType.Fulltext, ["title"], ['asc']),
            databases.createIndex(db, questionCollection, "content_index", IndexType.Fulltext, ["content"], ['asc']),
        ])
        console.log("Question Collection Indexes Created Successfully")

    } catch (error: any) {
        console.log(error.message)
    }
}