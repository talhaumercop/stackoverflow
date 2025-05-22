import { Client, Databases, Account, Storage, Avatars, Users } from "node-appwrite"
import env from "@/app/env";


let client = new Client()
    .setEndpoint(env.appwrite.endpoint) // Your API Endpoint
    .setProject(env.appwrite.projectId) // Your project ID
    .setKey(env.appwrite.apiKey) // Your secret API key
    ;

//got it from sdk section for server in appwrite docs


// got it from client side config
const databases = new Databases(client)
const account = new Account(client);
const avatars = new Avatars(client)
const storage = new Storage(client)
const users = new Users(client)

export { client, databases, account, avatars, storage, users }
