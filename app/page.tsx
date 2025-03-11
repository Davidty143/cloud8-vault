"use client";
import Image from "next/image";
import Link from "next/link"; // Import Link from next/link

export default function Home() {
  const handleUploadClick = () => {
    alert("Button clicked! Upload file action can be triggered here.");
  };
  return (
    <main>
      {/* Main Wrapper */}
      <div className="min-h-screen flex justify-center">
        {/* Focus Content */}
        <div className=" w-[1250px] 2xl:w-[80%] flex flex-col">
          {/* Main Body */}
          <div className=" w-full h-[100vh] flex flex-col border-2 border-t-0 border-b-0 border-gray-300">
            {/* Content Body */}
            <div className=" w-full flex items-center justify-center">
              <div className=" mt-20 px-4 py-2 text-gray-800 text-xl font-semibold">
                Welcome Back!
              </div>
            </div>
            <div className=" w-full flex items-center justify-center">
              <div className="mt-16 px-4 py-2 text-black text-4xl font-bold">
                A simple cloud storage web application
              </div>
            </div>
            <div className=" w-full flex items-center justify-center">
              <Link href="/storage">
                <button className="bg-black px-8 py-4 mt-8 text-white rounded">
                  View Cloud Storage
                </button>
              </Link>
            </div>
            {/* Sidebar Body */}
            <div className=" w-[300px] flex-shrink-0"></div>
          </div>
          {/* Footer */}
          <div className=" border-2 w-full h-[10vh] text-gray-800 text-center flex items-center justify-center text-lg">
            By: David Ty
          </div>
        </div>
      </div>
    </main>
  );
}
