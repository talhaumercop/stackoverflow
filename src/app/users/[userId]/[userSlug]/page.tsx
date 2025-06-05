import { answerCollection, db, questionCollection } from "@/models/name"
import { databases, users } from "@/models/server/config"
import { UserPreferences } from "@/ZustandStore/Auth"
import { Query } from "node-appwrite"

const userPage = async ({ params }: { params: { userId: string, userSlug: string } }) => {
    const [user, questions, answers] = await Promise.all([
        users.get<UserPreferences>(params.userId),
        databases.listDocuments(db, questionCollection, [
            Query.equal("author", params.userId),
            Query.limit(1)
        ]),
        databases.listDocuments(db, answerCollection, [
            Query.equal('author', params.userId),
            Query.limit(1)
        ])
    ])
    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl p-8 shadow-lg">
                {/* User Info Section */}
                <div className="flex items-center gap-6 mb-8">
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                        alt={user.name}
                        className="w-20 h-20 rounded-full border-4 border-indigo-500"
                    />
                    <div>
                        <h1 className="text-3xl font-bold text-indigo-400">{user.name}</h1>
                        <p className="text-gray-300 mt-1">Reputation: {user.prefs?.reputation || 0}</p>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-6 text-center">
                    <div className="bg-gray-700 rounded-xl p-6">
                        <p className="text-2xl font-bold text-green-400">{questions.total}</p>
                        <p className="text-gray-300">Questions Asked</p>
                    </div>
                    <div className="bg-gray-700 rounded-xl p-6">
                        <p className="text-2xl font-bold text-yellow-400">{answers.total}</p>
                        <p className="text-gray-300">Answers Given</p>
                    </div>
                </div>
            </div>
        </div>
    )

}
export default userPage