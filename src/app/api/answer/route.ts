import { answerCollection, db } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPreferences } from "@/ZustandStore/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";


/// This is the route for creating an answer
export async function POST(request:NextRequest){
    try {
        const {questionId,answer,authorId}=await request.json()
        if(!questionId || !answer || !authorId){
            return NextResponse.json({
                error:"missing required fields"
            },{status:400})
        }
        const response= await databases.createDocument(db,answerCollection,ID.unique(),{
            questionId:questionId,
            author:authorId,
            content:answer
        })
        //update the user preferences
        const prefs= await users.getPrefs<UserPreferences>(authorId)
        await users.updatePrefs(authorId, {
            reputation: Number(prefs.reputation) + 1
        })
        return NextResponse.json({
            success:true,
            message:"answer created successfully",
            data:response
        },{status:201})
    } catch (error:any) {
        return NextResponse.json({
            error:error?.message || "error creating the answer"
        },{status:500})
    }
}

/// This is the route for deleting an answer
export async function DELETE(request:NextRequest){
    try {
        const {answerId}=await request.json()
        if(!answerId ){
            return NextResponse.json({
                error:"missing required fields"
            },{status:400})
        }
        const answer= await databases.getDocument(db,answerCollection,answerId)
        const authorId=answer.author
        if(!answer || !authorId){
            return NextResponse.json({
                error:"answer not found"
            },{status:404})
        }
        const response= await databases.deleteDocument(db,answerCollection,answerId)
        const prefs= await users.getPrefs<UserPreferences>(authorId)
        await users.updatePrefs<UserPreferences>(authorId, {
            reputation:Number(prefs.reputation)-1
        })

        return NextResponse.json({
            success:true,
            message:"answer deleted successfully",
            data:response
        },{status:200})
    } catch (error:any) {
        return NextResponse.json({
            error:error?.message || "error deleting the answer"
        },{status:500})
    }
}