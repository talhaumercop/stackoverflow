import { Permission } from "appwrite"
import { attachmentBucket } from "../name"
import { storage } from "./config"


export default async function getOrCreateStorage() {
    try {
        await storage.getBucket(attachmentBucket)
        console.log("Storage bucket already exists, Storage Conneted")
    } catch (error: any) {
        try {
            await storage.createBucket(attachmentBucket, attachmentBucket,
                [
                    Permission.read("any"),
                    Permission.read("users"),
                    Permission.create("users"),
                    Permission.update("users"),
                    Permission.delete("users"),
                ],
                false,
                undefined,
                undefined,
                [
                    "jpg",
                    "png",
                    "jpeg",
                    "gif",
                    "svg",
                    "webp",
                ]
            )
            console.log("Storage bucket created, Storage Connected")
        } catch (error: any) {
            console.log(error.message)
        }
    }
}