'use client'
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import QuestionForm from "@/components/questionForm";

const Page = () => {
    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden">
            {/* Background Flickering Grid - positioned absolutely behind content */}
            <div className="absolute inset-0 -z-10">
                <FlickeringGrid className="w-full h-full" />
            </div>
            
            {/* Content container with proper z-index */}
            <div className="relative z-10 w-full max-w-2xl px-4 py-12">
                <div className="bg-black/10 backdrop-blur-sm border border-gray-800 rounded-xl p-8 shadow-2xl">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-white mb-2">Ask a Question</h1>
                        <p className="text-gray-400">Please use the form below to ask your question.</p>
                    </div>
                    
                    {/* QuestionForm with transparent background to show grid faintly */}
                    <div className="bg-gray-900/70 rounded-lg p-1">
                        <QuestionForm />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;