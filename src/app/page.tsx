"use client";
import { Ripple } from "@/components/magicui/ripple";
import Image from "next/image";
import { navbar } from "./components/navbar";
import { MorphingText } from "@/components/magicui/morphing-text";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import Link from "next/link";
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-white">
      <Ripple />
      {navbar()}
      <div className="w-full flex flex-col justify-center items-center gap-5">
        <MorphingText texts={["CODE", "CASCADE", "ASK", "REPLY"]} />
        <p>
          ITS A BEGINIG OF A NEW ERA IN CODING, WHERE YOU CAN ASK, REPLY AND CODE WITH EASE.
        </p>
      </div>
      <div className="mt-10">
        <Link href="/questions/ask">
        <ShimmerButton>
          ASK A QUESTION
        </ShimmerButton>
        </Link>


      </div>

    </div>

  );
}
