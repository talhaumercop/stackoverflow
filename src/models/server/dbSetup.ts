import { db } from "../name";
import { databases } from "./config";
import createQuestionCollection from "./question.collection";
import createAnswerCollection from "./answer.collection";
import createCommentCollection from "./comments.collection";
import createVoteCollection from "./vote.collection";


export default async function setupDB() {
    try {
        await databases.get(db)
        console.log("Database connected")
    } catch (error) {
        try {
            await databases.create(db, db, true)
            console.log("Database created")

            //create collections
            await Promise.all([
                createQuestionCollection(),
                createAnswerCollection(),
                createCommentCollection(),
                createVoteCollection(),
            ])
            console.log("All collections created")
        } catch (error: any) {
            console.log("Error creating database", error.message)
        }
    }
    return databases;
}