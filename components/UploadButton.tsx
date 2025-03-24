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

const Modal = ({
  message,
  onClose,
  isError,
}: {
  message: string;
  onClose: () => void;
  isError: boolean;
}) => (
  <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
    <div
      className={`bg-white p-6 rounded-lg shadow-lg w-96 relative ${
        isError ? "border-red-500 border" : "border-green-500 border"
      }`}
    >
      <h3 className="text-xl font-semibold mb-4">
        {isError ? "Error" : "Success"}
      </h3>
      <p className="mb-4">{message}</p>
      <button
        onClick={onClose}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Close
      </button>
    </div>
  </div>
);

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
  const [error, setError] = useState<string>(""); // State for error messages
  const [successMessage, setSuccessMessage] = useState<string>(""); // State for success message
  const [isError, setIsError] = useState<boolean>(false); // State to handle error or success popups
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

  // Validate form inputs
  const validateForm = (): boolean => {
    const { account_name, email, contact_number, gender, country } = profile;

    // Check for empty fields
    if (!account_name || !email || !contact_number || !gender || !country) {
      setError("Please fill in all the fields.");
      setIsError(true);
      return false;
    }

    // Check if email is valid
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setIsError(true);
      return false;
    }

    // Check if contact number contains only digits
    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(contact_number)) {
      setError("Contact number should contain only digits.");
      setIsError(true);
      return false;
    }

    // Check if file is selected and valid
    if (!file) {
      setError("Please select a valid image file.");
      setIsError(true);
      return false;
    }

    return true;
  };

  // Handle file upload with compression (only images)
  const handleUploadClick = async () => {
    if (!validateForm()) return; // Validate before proceeding

    if (file && file.type.startsWith("image/")) {
      new Compressor(file, {
        quality: 0.6,
        success: async (result) => {
          // Cast the result to a File object to ensure it has the 'name' property
          const uploadFile = result as File; // Typecast 'result' to File

          const fileName = uploadFile.name.replace(/\s+/g, "_"); // Clean the file name by replacing spaces with underscores
          const filePath = await uploadToSupabase(uploadFile); // Upload compressed image and get the file path
          if (filePath) {
            await saveProfileInfo(filePath); // Save profile information including file path
          }
        },
        error: (err) => {
          console.error("Compression failed:", err);
        },
      });
    } else {
      setError("Please select a valid image file.");
      setIsError(true);
    }
  };

  // Upload file to Supabase and return the file path (not the full URL)
  const uploadToSupabase = async (uploadFile: File) => {
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
      setError("Error checking for existing file: " + listError.message);
      setIsError(true);
      setLoading(false);
      return null;
    }

    // If the file already exists, delete it
    if (existingFiles && existingFiles.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from("storage")
        .remove([`profile_photos/${fileName}`]);

      if (deleteError) {
        setError("Error removing existing file: " + deleteError.message);
        setIsError(true);
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
      setError("Error uploading file to Supabase: " + error.message);
      setIsError(true);
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
      setError("Please complete the profile information.");
      setIsError(true);
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
      {
        onConflict: "email", // Conflict on the 'email' column (not array of strings)
      }
    );

    if (error) {
      setError("Error saving profile information: " + error.message);
      setIsError(true);
    } else {
      setSuccessMessage("Profile Uploaded!");
      setIsError(false);
      setTimeout(() => {
        window.location.reload(); // Refresh the page after success
      }, 1500); // Delay the page refresh by 1.5 seconds to let the success message appear
    }
  };

  const handleOpenUploadForm = () => {
    setShowUploadForm(true);
  };

  const handleCloseUploadForm = () => {
    setShowUploadForm(false);
    setError(""); // Clear any previous errors when closing the form
    setSuccessMessage(""); // Clear success message when closing
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
            <h3 className="text-xl font-semibold mb-4">Add User Information</h3>

            {/* Display error or success message */}
            {(error || successMessage) && (
              <Modal
                message={error || successMessage}
                onClose={handleCloseUploadForm}
                isError={isError}
              />
            )}

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
              <option value="Singapore">Singapore</option>
              <option value="Indonesia">Indonesia</option>
              <option value="Thailand">Thailand</option>
            </select>

            {/* Upload Photo Section */}
            <h4 className="text-md font-semibold mt-4 mb-2">
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
              className="w-full py-2 bg-black text-white rounded"
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
