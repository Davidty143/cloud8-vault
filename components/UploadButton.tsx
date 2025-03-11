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
  const [loading, setLoading] = useState(false); // State for loading status
  const [profile, setProfile] = useState({
    account_name: "",
    email: "",
    contact_number: "",
    gender: "", // Add gender to the profile state
    country: "", // Add country to the profile state
  }); // State to store profile form data
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

  // Handle profile form input change
  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Handle file upload with compression (only images)
  const handleUploadClick = async () => {
    if (!file) {
      alert("Please select a file to upload!");
      return;
    }

    if (file.type.startsWith("image/")) {
      new Compressor(file, {
        quality: 0.6,
        success: async (result) => {
          const filePath = await uploadToSupabase(result); // Upload compressed image and get the file path
          if (filePath) {
            await saveProfileInfo(filePath); // Save profile information including file path
          }
        },
        error: (err) => {
          console.error("Compression failed:", err);
        },
      });
    } else {
      alert("Please select a valid image file.");
    }
  };

  // Upload file to Supabase and return the file path (not the full URL)
  const uploadToSupabase = async (uploadFile: Blob) => {
    console.log("Uploading file to Supabase...");

    const fileName = uploadFile.name.replace(/\s+/g, "_"); // Clean the file name by replacing spaces with underscores

    setLoading(true); // Set loading to true while uploading

    // Check if the file already exists in Supabase storage
    const { data: existingFiles, error: listError } = await supabase.storage
      .from("storage")
      .list("profile_photos", {
        search: fileName,
      });

    if (listError) {
      alert("Error checking for existing file: " + listError.message);
      console.error("Error checking file existence:", listError);
      setLoading(false);
      return null;
    }

    // If the file already exists, delete it
    if (existingFiles && existingFiles.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from("storage")
        .remove([`profile_photos/${fileName}`]);

      if (deleteError) {
        alert("Error removing existing file: " + deleteError.message);
        console.error("Error deleting file:", deleteError);
        setLoading(false);
        return null;
      }

      console.log("Existing file removed successfully");
    }

    // Upload the new file to Supabase storage
    const { data, error } = await supabase.storage
      .from("storage") // Ensure you're using the correct bucket name
      .upload(`profile_photos/${fileName}`, uploadFile, {
        cacheControl: "3600",
        upsert: false, // Do not overwrite the file if it already exists
      });

    setLoading(false); // Set loading to false once the upload is complete

    if (error) {
      alert("Error uploading file to Supabase: " + error.message);
      console.error("Upload error:", error);
      return null;
    }

    // Log the response data to ensure it's uploaded correctly
    console.log("File upload data:", data);

    // Return the file path for saving to the database
    const filePath = `profile_photos/${fileName}`;
    console.log("File uploaded successfully. File path:", filePath);

    return filePath; // Return the file path (not the public URL)
  };

  // Save profile information to the database, storing only the file path
  const saveProfileInfo = async (filePath: string) => {
    const { account_name, email, contact_number, gender, country } = profile;
    if (
      !account_name ||
      !email ||
      !contact_number ||
      !gender ||
      !country ||
      !filePath
    ) {
      alert("Please complete the profile information.");
      console.error("Incomplete profile data.");
      return;
    }

    console.log("Saving profile information to database...");

    const { data, error } = await supabase.from("Profile").upsert(
      {
        account_name,
        email,
        contact_number,
        gender,
        country,
        photo_url: filePath, // Save the file path instead of the full URL
      },
      { onConflict: ["email"] } // To update profile info based on email (unique key)
    );

    if (error) {
      alert("Error saving profile information: " + error.message);
      console.error("Error saving profile data:", error);
    } else {
      alert("Profile information saved successfully!");
      console.log("Profile data saved:", data);
    }
  };

  const handleOpenUploadForm = () => {
    setShowUploadForm(true);
  };

  const handleCloseUploadForm = () => {
    setShowUploadForm(false);
  };

  return (
    <div className="flex justify-end">
      {/* Upload button */}
      <button
        onClick={handleOpenUploadForm}
        className="px-4 py-2 bg-black mt-6 mr-6 text-white rounded"
      >
        Add User Information
      </button>

      {/* Upload form overlay */}
      {showUploadForm && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
          <div
            ref={formRef} // Attach the ref here
            className="bg-white p-6 rounded-lg shadow-lg w-96 relative"
          >
            <button
              onClick={handleCloseUploadForm}
              className="absolute top-2 right-2 text-xl text-gray-500"
            >
              &times;
            </button>
            <h3 className="text-lg font-bold mb-4">Add User Information</h3>

            {/* Profile Info Fields */}
            <input
              type="text"
              name="account_name"
              value={profile.account_name}
              onChange={handleProfileChange}
              placeholder="Account Name"
              className="mb-4 w-full border border-gray-300 p-2 rounded"
            />
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              placeholder="Email"
              className="mb-4 w-full border border-gray-300 p-2 rounded"
            />
            <input
              type="text"
              name="contact_number"
              value={profile.contact_number}
              onChange={handleProfileChange}
              placeholder="Contact Number"
              className="mb-4 w-full border border-gray-300 p-2 rounded"
            />

            {/* Gender Selector */}
            <select
              name="gender"
              value={profile.gender}
              onChange={handleProfileChange}
              className="mb-4 w-full border border-gray-300 p-2 rounded"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            {/* Country Selector */}
            <select
              name="country"
              value={profile.country}
              onChange={handleProfileChange}
              className="mb-4 w-full border border-gray-300 p-2 rounded"
            >
              <option value="">Select Country</option>
              <option value="Philippines">Philippines</option>
              <option value="USA">USA</option>
              <option value="Canada">Canada</option>
              <option value="India">India</option>
              <option value="Australia">Australia</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Germany">Germany</option>
              <option value="Germany">Singapore</option>
              <option value="Germany">indonesia</option>
              <option value="Germany">Thailand</option>
            </select>

            {/* Upload Photo Section */}
            <h4 className="text-md font-bold mt-4 mb-2">
              Upload Profile Photo
            </h4>
            <input
              type="file"
              accept="image/*" // Only accept images
              onChange={handleFileChange}
              className="mb-4 w-full"
            />
            <button
              onClick={handleUploadClick}
              className="w-full py-2 bg-blue-500 text-white rounded"
              disabled={loading} // Disable button while uploading
            >
              {loading ? "Uploading..." : "Upload Photo"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
