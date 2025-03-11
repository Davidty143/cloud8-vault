"use client";
import { useState, useRef, useEffect } from "react";
import Compressor from "compressorjs"; // Import the Compressor library
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client using environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UploadButtonProps {
  fetchFiles: () => void; // Function to fetch the files after upload
}

export default function UploadButton({ fetchFiles }: UploadButtonProps) {
  const [showUploadForm, setShowUploadForm] = useState(false); // State to manage overlay visibility
  const [file, setFile] = useState<File | null>(null); // State to store selected file
  const formRef = useRef<HTMLDivElement | null>(null); // Ref for the form

  // Close the form when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowUploadForm(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Handle file upload with compression
  const handleUploadClick = async () => {
    if (!file) {
      alert("Please select a file to upload!");
      return;
    }

    if (file.type.startsWith("image/")) {
      new Compressor(file, {
        quality: 0.6,
        success: async (result) => {
          await uploadToSupabase(result); // Upload compressed image
        },
        error: (err) => {
          console.error("Compression failed:", err);
        },
      });
    } else {
      await uploadToSupabase(file); // If not an image, upload directly
    }
  };

  // Upload file to Supabase
  const uploadToSupabase = async (uploadFile: Blob) => {
    const fileName = uploadFile.name;

    const { data, error } = await supabase.storage
      .from("storage")
      .upload(`cloud/${fileName}`, uploadFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      alert("Error uploading file to Supabase: " + error.message);
      console.error(error);
    } else {
      alert("File uploaded successfully to Supabase!");
      console.log("Uploaded file:", data);
      fetchFiles(); // Re-fetch the list of files after upload
      setShowUploadForm(false); // Close the upload form after successful upload
    }
  };

  const handleOpenUploadForm = () => {
    setShowUploadForm(true);
  };

  const handleCloseUploadForm = () => {
    setShowUploadForm(false);
  };

  return (
    <div>
      {/* Upload button */}
      <button
        onClick={handleOpenUploadForm}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Upload File
      </button>

      {/* Upload form overlay */}
      {showUploadForm && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
          <div
            ref={formRef} // Attach the ref here to detect clicks outside
            className="bg-white p-6 rounded-lg shadow-lg w-96 relative"
          >
            <button
              onClick={handleCloseUploadForm}
              className="absolute top-2 right-2 text-xl text-gray-500"
            >
              &times;
            </button>
            <h3 className="text-lg font-bold mb-4">Upload File</h3>
            <input
              type="file"
              accept="image/*,.pdf,.txt,.docx,.xlsx"
              onChange={handleFileChange}
              className="mb-4 w-full"
            />
            <button
              onClick={handleUploadClick}
              className="w-full py-2 bg-blue-500 text-white rounded"
            >
              Upload File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
