import { answerCollection, db, questionCollection, votesCollection } from "@/models/name"
import { databases, users } from "@/models/server/config"
import { UserPreferences } from "@/ZustandStore/Auth"
import { Query } from "node-appwrite"
import Search from "./Search"
import Link from "next/link"
import slugify from "@/utils/slugify"

const QuestionsPage = async (
    {searchParams}:{searchParams:{page?: string, tag?:string, search?: string}}
)=>{
    searchParams.page ||= '1'
    const queries=[
        Query.orderDesc('$createdAt'),
        Query.offset((+searchParams.page - 1)*25),
        Query.limit(25)
    ]
    if(searchParams.tag) queries.push(Query.equal('tags',searchParams.tag))
    if(searchParams.search) queries.push(
        Query.or([
            Query.search('content',searchParams.search),
            Query.search('title',searchParams.search)
        ])
    )
    const questions= await databases.listDocuments(db,questionCollection,queries)
    console.log('questions',questions)

    // if(!questions.documents){
    //     return
    // }
    questions.documents= await Promise.all(
        questions.documents.map(async ques=>{
            const [author,answers,votes]=await Promise.all([
                users.get<UserPreferences>(ques.author),
                databases.listDocuments(db,answerCollection,[
                    Query.equal("questionId",ques.$id),
                    Query.limit(1)
                ]),
                databases.listDocuments(db,votesCollection,[
                    Query.equal('type',"question"),
                    Query.equal('typeId',ques.$id),
                    Query.limit(1)
                ])
            ])
            return {
                ...ques,
                totalAnswers:answers.total,
                totalVotes:votes.total,
                author:{
                    $id:author.$id,
                    reputation:author.prefs.reputation,
                    name:author.name
                }
            }
        })
    )
    // ... (previous code remains the same)

return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-gray-100 p-6">
    {/* Floating background elements */}
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-700 opacity-10 blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/3 w-96 h-96 rounded-full bg-blue-700 opacity-10 blur-3xl animate-pulse delay-300"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-pink-700 opacity-10 blur-3xl animate-pulse delay-700"></div>
    </div>

    <div className="max-w-7xl mx-auto relative">
        {/* Search and Filter Section */}
        <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                All Questions
            </h1>
            <div className="flex gap-4">
                {searchParams.tag && (
                    <span className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-sm font-medium backdrop-blur-sm bg-opacity-60 border border-purple-300 border-opacity-20 shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105">
                        {searchParams.tag}
                    </span>
                )}
            </div>
        </div>
        
        <div className="mb-6">
            <Search />
        </div>
        
        {/* Questions List */}
        <div className="space-y-6">
            {questions.documents.map((question) => (
                <Link href={`/questions/${question.$id}/${slugify(question.title)}`}>
                <div
                    key={question.$id}
                    className="relative overflow-hidden rounded-xl backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 group"
                >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="p-6 relative">
                        <div className="flex items-start gap-6">
                            {/* Vote Count */}
                            <div className="flex flex-col items-center text-center min-w-[72px]">
                                <span className="text-2xl font-bold bg-gradient-to-b from-indigo-300 to-purple-400 bg-clip-text text-transparent">
                                    {question.totalVotes}
                                </span>
                                <span className="text-xs text-gray-400 uppercase tracking-wider">votes</span>
                            </div>

                            {/* Answer Count */}
                            <div className="flex flex-col items-center text-center min-w-[72px]">
                                <span className="text-2xl font-bold bg-gradient-to-b from-green-300 to-teal-400 bg-clip-text text-transparent">
                                    {question.totalAnswers}
                                </span>
                                <span className="text-xs text-gray-400 uppercase tracking-wider">answers</span>
                            </div>

                            {/* Question Content */}
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold mb-3 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                                    {question.title}
                                </h2>
                                <p className="text-gray-300 line-clamp-2 mb-5">
                                    {question.content}
                                </p>

                                {/* Tags */}
                                <div className="flex gap-2 flex-wrap">
                                    {question.tags?.map((tag: string) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 bg-gray-700/50 rounded-full text-xs font-medium backdrop-blur-sm border border-gray-600/30 hover:bg-purple-600/30 hover:border-purple-400/30 hover:scale-105 transition-all duration-200"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Author Info */}
                                <div className="mt-5 flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                        {question.author.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-gray-400">
                                        <span>Asked by </span>
                                        <span className="font-medium bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                                            {question.author.name}
                                        </span>
                                        <span className="mx-2">•</span>
                                        <span>Rep: <span className="text-yellow-300">{question.author.reputation}</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </Link>
            ))}
        </div>

        {/* Pagination */}
        <div className="mt-10 flex justify-center gap-3">
            {+searchParams.page > 1 && (
                <a
                    href={`/questions?page=${+searchParams.page - 1}`}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-medium backdrop-blur-sm bg-opacity-80 border border-purple-300 border-opacity-20 shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105"
                >
                    Previous
                </a>
            )}
            <a
                href={`/questions?page=${+searchParams.page + 1}`}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-medium backdrop-blur-sm bg-opacity-80 border border-purple-300 border-opacity-20 shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105"
            >
                Next
            </a>
        </div>
    </div>
</div>
);
}
export default QuestionsPage