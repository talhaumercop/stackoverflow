import {db, votesCollection } from "@/models/name";
import { databases } from "@/models/server/config";
import { NextRequest,NextResponse } from "next/server";
import { Query } from "node-appwrite";

export async function POST(request: NextRequest) {
    try {
        const {voteStatus,typeId,votedById,type}= await request.json();
        if (!voteStatus || !typeId || !votedById || !type) {
            return NextResponse.json({
                error: "Missing required fields",
                status: 400
            });
        }
        const response= await databases.listDocuments(db,votesCollection,[
            Query.equal("typeId", typeId),
            Query.equal("votedById", votedById),
            Query.equal("type", type)
        ])
        if(response.documents.length>0){}
        if(response.documents[0].voteStatus !== voteStatus){}
    } catch (error:any) {
        return NextResponse.json({
            error: error.message || "error in vote",
            status: 500
        });
    }
}