import { answerCollection, db, questionCollection, votesCollection } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPreferences } from "@/ZustandStore/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

export async function POST(request: NextRequest) {
    try {
        const { voteStatus, typeId, votedById, type } = await request.json();

        if (!voteStatus || !typeId || !votedById || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Check if the user has already voted on this typeId
        const existingVotes = await databases.listDocuments(db, votesCollection, [
            Query.equal("typeId", typeId),
            Query.equal("votedById", votedById),
            Query.equal("type", type)
        ]);

        const existingVote = existingVotes.documents[0];

        // 2. Get author of the content (question/answer)
        const contentDoc = await databases.getDocument(
            db,
            type === "question" ? questionCollection : answerCollection,
            typeId
        );

        const authorId = contentDoc.author;
        const authorPrefs = await users.getPrefs<UserPreferences>(authorId);

        let reputation = Number(authorPrefs.reputation) || 0;

        // 3. If already voted with same vote → remove vote (toggle off)
        if (existingVote && existingVote.voteStatus === voteStatus) {
            await databases.deleteDocument(db, votesCollection, existingVote.$id);

            reputation += voteStatus === "upvote" ? -1 : +1;
            await users.updatePrefs<UserPreferences>(authorId, { reputation });

            // recalculate upvotes/downvotes
            const [upvotes, downvotes] = await Promise.all([
                databases.listDocuments(db, votesCollection, [
                    Query.equal("typeId", typeId),
                    Query.equal("voteStatus", "upvote")
                ]),
                databases.listDocuments(db, votesCollection, [
                    Query.equal("typeId", typeId),
                    Query.equal("voteStatus", "downvote")
                ])
            ]);

            return NextResponse.json({
                data: {
                    document: null,
                    voteResult: upvotes.total - downvotes.total
                }
            });
        }

        // 4. If different vote exists → delete old one and apply new
        if (existingVote) {
            await databases.deleteDocument(db, votesCollection, existingVote.$id);
            reputation += existingVote.voteStatus === "upvote" ? -1 : +1;
        }

        // 5. Create new vote
        const newVote = await databases.createDocument(
            db,
            votesCollection,
            ID.unique(),
            { voteStatus, votedById, typeId, type }
        );

        reputation += voteStatus === "upvote" ? +1 : -1;

        await users.updatePrefs<UserPreferences>(authorId, { reputation });

        // 6. Return updated vote result
        const [upvotes, downvotes] = await Promise.all([
            databases.listDocuments(db, votesCollection, [
                Query.equal("typeId", typeId),
                Query.equal("voteStatus", "upvote")
            ]),
            databases.listDocuments(db, votesCollection, [
                Query.equal("typeId", typeId),
                Query.equal("voteStatus", "downvote")
            ])
        ]);

        return NextResponse.json({
            data: {
                document: newVote,
                voteResult: upvotes.total - downvotes.total
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}
