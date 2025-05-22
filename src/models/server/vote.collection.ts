import { db, votesCollection } from "../name";
import { databases } from "./config";
import { Permission } from "appwrite";


export default async function createVoteCollection() {
    try {
        await databases.createCollection(db, votesCollection, votesCollection,
            [
                Permission.read("any"),
                Permission.read("users"),
                Permission.create("users"),
                Permission.update("users"),
                Permission.delete("users"),
            ])
        console.log("Vote collection created, Vote Collection Connected")

        //attributes
        await Promise.all([
            databases.createEnumAttribute(db, votesCollection, "voteStatus",
                [
                    "upvote",
                    "downvote",
                ],
                true
            ),
            databases.createEnumAttribute(db, votesCollection, "type",
                [
                    "question",
                    "amswers"
                ],
                true
            ),
            databases.createStringAttribute(db, votesCollection, "typeId", 50, true),
            databases.createStringAttribute(db, votesCollection, "votedById", 50, true),
        ])
        console.log("Attributes created for vote collection")
    } catch (error: any) {
        console.log(error.message)
    }
}

