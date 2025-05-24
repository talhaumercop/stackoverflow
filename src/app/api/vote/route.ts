import { answerCollection, db, questionCollection, votesCollection } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPreferences } from "@/ZustandStore/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

export async function POST(request: NextRequest) {
    try {
        const { voteStatus, typeId, votedById, type } = await request.json();
        if (!voteStatus || !typeId || !votedById || !type) {
            return NextResponse.json({
                error: "Missing required fields",
                status: 400
            });
        }
        const response = await databases.listDocuments(db, votesCollection, [
            Query.equal("typeId", typeId),
            Query.equal("votedById", votedById),
            Query.equal("type", type)
        ])
        if (response.documents.length > 0) {
            await databases.deleteDocument(db, votesCollection, response.documents[0].$id)
            const questionORanswer = await databases.getDocument(db, type === "question" ? questionCollection : answerCollection, typeId)
            //update the user reputation
            const user = await users.getPrefs<UserPreferences>(questionORanswer.author);
            await users.updatePrefs<UserPreferences>(questionORanswer.author, {
                reputation: response.documents[0].voteStatus === "upvote" ? user.reputation - 1 : user.reputation + 1
            })
        }
        if (response.documents[0].voteStatus !== voteStatus) {
            //should we create or update the vote
            const voteData = {
                typeId,
                votedById,
                type,
                voteStatus
            };
            const doc = await databases.createDocument(
                db,
                votesCollection,
                ID.unique(),
                voteData
            );
            //increment or decrement the user reputation
            const questionORanswer = await databases.getDocument(db, type === "question" ? questionCollection : answerCollection, typeId);
            const user = await users.getPrefs<UserPreferences>(questionORanswer.author);

            //if vote was already prese t
            if (response.documents[0]) {
                await users.updatePrefs<UserPreferences>(questionORanswer.author, {
                    reputation: voteStatus === "upvote" ? Number(user.reputation) - 1 : Number(user.reputation) + 1
                });
            }
            else {
                await users.updatePrefs<UserPreferences>(questionORanswer.author, {
                    reputation: voteStatus === "upvote" ? Number(user.reputation) + 1 : Number(user.reputation) - 1
                });
            }
            return NextResponse.json(
                {
                    data: {
                        documents: doc,
                        voteStatus: voteStatus
                    }
                },
                {
                    status: 200
                }
            );
        }
        const [upvote, downvote] = await Promise.all([
            databases.listDocuments(db, votesCollection, [
                Query.equal("typeId", typeId),
                Query.equal("votedById", votedById),
                Query.equal("voteStatus", "upvote")
            ]),
            databases.listDocuments(db, votesCollection, [
                Query.equal("typeId", typeId),
                Query.equal("votedById", votedById),
                Query.equal("voteStatus", "downvote")
            ])
        ])
        return NextResponse.json(
            {
                data: {
                    documents: null,
                    voteStatus: upvote.total = downvote.total
                }
            },
            {
                status: 200
            }
        )
    } catch (error: any) {
        return NextResponse.json({
            error: error.message || "error in vote",
            status: 500
        });
    }
}