import { storage } from "@/models/client/config";
import { answerCollection, attachmentBucket, commentCollection, db, questionCollection, votesCollection } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPreferences } from "@/ZustandStore/Auth";
import { Query } from "node-appwrite";
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, ThumbsUp, ThumbsDown, Share2, Bookmark, Edit2, Trash2 } from 'react-feather';
import Link from "next/link";
import EditQuestion from "./EditQuestion";


const Question = async ({ params }: { params: { questId: string, questName: string } }) => {
    // Add these interfaces at the top of your file
    // Add these interfaces at the top of your file
    interface AppwriteDocument {
        $id: string;
        $createdAt: string;
        $updatedAt: string;
    }

    interface Comment extends AppwriteDocument {
        content: string; // Note: changed from 'text' to 'content' to match your schema
        type: 'question' | 'answer';
        typeId: string;
        author: {
            $id: string;
            name: string;
            reputation: number;
        };
    }

    interface Answer extends AppwriteDocument {
        $id: string;
        body: string;
        author: {
            $id: string;
            name: string;
            reputation: number;
        };
        comments: Comment[];
        upvotesDocuments: any[];
        downvotesDocuments: any[];
    }
    const [question, upvote, downvote, answers, comments] = await Promise.all([
        await databases.getDocument(db, questionCollection, params.questId),
        await databases.listDocuments(db, votesCollection, [
            Query.equal("typeId", params.questId),
            Query.equal("type", "question"),
            Query.equal("voteStatus", "upvote"),
            Query.limit(1)
        ]),
        await databases.listDocuments(db, votesCollection, [
            Query.equal("typeId", params.questId),
            Query.equal("type", "question"),
            Query.equal("voteStatus", "downvote"),
            Query.limit(1)
        ]),
        databases.listDocuments(db, answerCollection, [
            Query.orderDesc("questionId"),
            Query.equal("questionId", params.questId),
        ]),
        await databases.listDocuments(db, commentCollection, [
            Query.equal("typeId", params.questId),
            Query.equal("type", "question"),
            // Query.orderDesc("createdAt"),
            Query.limit(10)
        ]),
    ])
    //fetching the author
    const author = await users.get<UserPreferences>(question.author);
    //fetching all the documents 
    const [hydratedComments, hydratedAnswers] = await Promise.all([
        // Step 1: Hydrate comments with author info
        Promise.all(
            comments.documents.map(async (comment) => {
                const user = await users.get<UserPreferences>(comment.author);
                return {
                    ...comment,
                    author: {
                        $id: user.$id,
                        name: user.name,
                        reputation: user.prefs.reputation,
                    },
                };
            })
        ),

        // Step 2: Hydrate answers with full info
        Promise.all(
            answers.documents.map(async (answer) => {
                // Fetch all related data in parallel
                const [author, answerComments, upvotes, downvotes] = await Promise.all([
                    users.get<UserPreferences>(answer.author),
                    databases.listDocuments(db, commentCollection, [
                        Query.equal("typeId", answer.$id),
                        Query.equal("type", "answer"),
                        // Query.orderDesc("createdAt"),
                    ]),
                    databases.listDocuments(db, votesCollection, [
                        Query.equal("typeId", answer.$id),
                        Query.equal("type", "answer"),
                        Query.equal("voteStatus", "upvote"),
                        Query.limit(100), // or remove limit if needed
                    ]),
                    databases.listDocuments(db, votesCollection, [
                        Query.equal("typeId", answer.$id),
                        Query.equal("type", "answer"),
                        Query.equal("voteStatus", "downvote"),
                        Query.limit(100),
                    ]),
                ]);

                // Hydrate comments under the answer
                const hydratedAnswerComments = await Promise.all(
                    answerComments.documents.map(async (comment) => {
                        const commentAuthor = await users.get<UserPreferences>(comment.author);
                        return {
                            ...comment,
                            author: {
                                $id: commentAuthor.$id,
                                name: commentAuthor.name,
                                reputation: commentAuthor.prefs.reputation,
                            },
                        };
                    })
                );

                return {
                    ...answer,
                    author: {
                        $id: author.$id,
                        name: author.name,
                        reputation: author.prefs.reputation,
                    },
                    comments: hydratedAnswerComments,
                    upvotesDocuments: upvotes.documents,
                    downvotesDocuments: downvotes.documents,
                };
            })
        )
    ]);

    // Assign back to your original variables if needed=
    comments.documents = hydratedComments;
    answers.documents = hydratedAnswers;
    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-purple-900 to-zinc-950">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <main className="relative max-w-5xl mx-auto px-4 py-8">
                {/* Question Card */}
                <article className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden mb-8 hover:shadow-purple-500/10 transition-all duration-500">
                    {/* Gradient border effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500"></div>
                    
                    <div className="relative p-6 md:p-8">
                        <div className="flex gap-4">
                            {/* Voting Controls */}
                            <div className="flex flex-col items-center space-y-2">
                                <button className="p-3 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95">
                                    <ThumbsUp className="w-6 h-6" />
                                </button>
                                <span className="px-3 py-1 font-bold text-xl text-white bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full shadow-lg">
                                    {upvote.total - downvote.total}
                                </span>
                                <button className="p-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95">
                                    <ThumbsDown className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Question Content */}
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-2 leading-tight">{question.title}</h1>

                                <div className="prose prose-lg max-w-none text-gray-300 mb-4 leading-relaxed">
                                    {question.body}
                                </div>

                                {/* Image Attachment */}
                                {question.attachmentId && (
                                    <div className="mb-6 rounded-xl border border-gray-600/50 overflow-hidden shadow-2xl">
                                        <img
                                            src={storage.getFileView(attachmentBucket, question.attachmentId)}
                                            alt={question.title}
                                            className="w-full h-auto max-h-96 object-contain"
                                        />
                                    </div>
                                )}

                                {/* Author and Metadata */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-gray-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                            {author?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-white">
                                                {author?.name || 'Unknown User'}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                {question.$createdAt
                                                    ? `Asked ${formatDistanceToNow(new Date(question.$createdAt), { addSuffix: true })}`
                                                    : question.$updatedAt
                                                        ? `Updated ${formatDistanceToNow(new Date(question.$updatedAt), { addSuffix: true })}`
                                                        : 'Posted'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>

                {/* Answers Section - With Proper Date Handling */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            {answers.documents.length} {answers.documents.length === 1 ? 'Answer' : 'Answers'}
                        </h2>
                    </div>

                    {answers.documents.map((answer) => {
                        // Safe date handling for answers
                        const answerDate = answer.$createdAt || answer.$updatedAt;
                        const answerDateText = answerDate
                            ? formatDistanceToNow(new Date(answerDate), { addSuffix: true })
                            : 'Posted';

                        return (
                            <article key={answer.$id} className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-xl border border-gray-700/30 overflow-hidden mb-6 hover:border-purple-500/30 transition-all duration-500 hover:shadow-lg hover:shadow-purple-500/5">
                                <div className="p-6">
                                    
                                    <div className="flex gap-4">
                                        {/* Answer Voting */}
                                        <div className="flex flex-col items-center space-y-2">
                                            <button className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-300 transform hover:scale-110">
                                                <ThumbsUp className="w-5 h-5" />
                                            </button>
                                            <span className="px-2 py-1 font-semibold text-white bg-gradient-to-r from-emerald-500/80 to-blue-500/80 rounded-lg text-sm">
                                                {answer.upvotesDocuments.length - answer.downvotesDocuments.length}
                                            </span>
                                            <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300 transform hover:scale-110">
                                                <ThumbsDown className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Answer Content */}
                                        <div className="flex-1">
                                            <div className="prose prose-lg max-w-none text-gray-300 mb-4 leading-relaxed">
                                                {answer.body}
                                            </div>

                                            {/* Answer Metadata */}
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-700/30">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-lg">
                                                        {answer.author?.name?.charAt(0).toUpperCase() || 'A'}
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-semibold text-white">
                                                            {answer.author?.name || 'Anonymous'}
                                                        </p>
                                                        <p className="text-sm text-gray-400">
                                                            {answerDateText}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Comments Section with Safe Date Handling */}
                                {answer.comments.length > 0 && (
                                    <div className="bg-gradient-to-r from-gray-900/40 to-gray-800/40 backdrop-blur-sm px-6 py-5 border-t border-gray-700/20">
                                        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-4">
                                            <MessageSquare size={16} className="text-blue-400" />
                                            {answer.comments.length} {answer.comments.length === 1 ? 'Comment' : 'Comments'}
                                        </h3>
                                        <div className="space-y-3">
                                            {/* Update the comment rendering section */}
                                            {answer.comments.map((comment: Comment) => {
                                                const commentDate = comment.$createdAt;
                                                const commentDateText = commentDate
                                                    ? formatDistanceToNow(new Date(commentDate), { addSuffix: true })
                                                    : 'Recently';

                                                return (
                                                    <div key={comment.$id} className="flex gap-3 p-3 bg-gray-800/30 rounded-lg backdrop-blur-sm border border-gray-700/20 hover:border-gray-600/30 transition-all duration-300">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center text-white font-medium text-sm flex-shrink-0 shadow-md">
                                                            {comment.author?.name?.charAt(0).toUpperCase() || 'C'}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-gray-300 leading-relaxed">{comment.content}</p> {/* Changed from text to content */}
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                — {comment.author?.name || 'Anonymous'} · {commentDateText}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                   
                    <div>
                        <EditQuestion
                            questionId={question.$id}
                            questionTitle={question.title}
                            authorId={question.author}
                        />
                    </div>
                </section>
            </main>
        </div>
    );
}
export default Question;