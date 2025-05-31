'use client';

import slugify from "@/utils/slugify";
import { useAuthStore } from "@/ZustandStore/Auth";
import Link from "next/link";

const EditQuestion = ({
  questionId,
  questionTitle,
  authorId,
}: {
  questionId: string;
  questionTitle: string;
  authorId: string;
}) => {
  const user = useAuthStore((state) => state.user); // ✅ reactively read Zustand state

  console.log("user id:", user?.$id);
  console.log("author id:", authorId);

  if (user?.$id !== authorId) {
    console.log("user didn't match");
    return null;
  }

  return (
    <div>
      <Link
        href={`/questions/${questionId}/${slugify(questionTitle)}/edit`}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
      >
        {/* <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"></svg>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg> */}
        Edit Question
      </Link>
    </div>
  );
};

export default EditQuestion;
