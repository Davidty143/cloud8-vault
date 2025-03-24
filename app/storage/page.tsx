"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import UploadButton from "@/components/UploadButton"; // Import the UploadButton component

// Initialize Supabase client using environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Storage() {
  const [userList, setUserList] = useState<any[]>([]); // State to store the list of users
  const [loading, setLoading] = useState<boolean>(false); // State to track loading state
  const [error, setError] = useState<string | null>(null); // State to handle errors

  // Fetch users from Supabase (not just files, but user info)
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.from("Profile").select("*"); // Get all users from 'Profile' table

      if (error) throw error;

      setUserList(data); // Store the list of users in the state
    } catch (err) {
      setError("Error fetching users from Supabase.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <main>
      <div className="min-h-screen flex justify-center">
        <div className="w-full 2xl:w-[80%] flex flex-col">
          {/* Main Body */}
          <div className="w-full flex flex-col justify-between  border-t-0 border-b-0 relative">
            {/* Add User Button Positioned to Top Right */}
            <div className="border-2 border-t-0 border-b-0">
              <UploadButton fetchFiles={fetchUsers} />
            </div>

            <div className="px-16 py-5 w-full flex items-start justify-start border-2 border-t-0 min-h-[75vh]">
              {/* User List */}
              <div>
                {loading && <p>Loading users...</p>}
                {error && <p>{error}</p>}
                <h2 className="font-semibold text-start text-xl py-5 w-full">
                  Users:
                </h2>

                {/* Grid Layout for Users */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {userList.map((user, index) => (
                    <div
                      key={index}
                      className="order-2 border-gray-200 p-4 w-full flex flex-col items-center rounded-lg shadow-md"
                    >
                      {/* User Profile Picture */}
                      {user.photo_url && (
                        <img
                          src={`https://qaibenssloborrcwhhnb.supabase.co/storage/v1/object/public/storage/${user.photo_url}`}
                          alt={user.account_name}
                          className="w-60 h-60 object-cover rounded-xl mb-4"
                        />
                      )}

                      {/* User Information */}
                      <h3 className="text-xl text-gray-800 font-semibold mb-2 text-center">
                        {user.account_name}
                      </h3>

                      {/* Email */}
                      <p className="text-gray-500 text-base mb-1 text-left w-full">
                        <span className="font-semibold text-blue-500">
                          Email:
                        </span>{" "}
                        <span className="text-gray-700">{user.email}</span>
                      </p>

                      {/* Contact */}
                      <p className="text-gray-500 text-base text-left w-full">
                        <span className="font-semibold text-green-500">
                          Contact:
                        </span>{" "}
                        <span className="text-gray-700">
                          {user.contact_number}
                        </span>
                      </p>

                      {/* Gender */}
                      {user.gender && (
                        <p className="text-gray-500 text-base text-left w-full">
                          <span className="font-semibold text-purple-500">
                            Gender:
                          </span>{" "}
                          <span className="text-gray-700">{user.gender}</span>
                        </p>
                      )}

                      {/* Country */}
                      {user.country && (
                        <p className="text-gray-500 text-base text-left w-full flex items-center">
                          <span className="font-semibold text-indigo-500">
                            Country:
                          </span>{" "}
                          <span className="text-gray-700 ml-2 flex items-center">
                            {user.country}
                          </span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-2 border-t-0 w-full h-[10vh]  text-gray-800 text-center flex items-center justify-center text-sm">
            @ 2025 David Ty. All Rights Reserved
          </div>
        </div>
      </div>
    </main>
  );
}
