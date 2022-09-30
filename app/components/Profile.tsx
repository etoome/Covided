import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import { AuthContext } from "../providers/Auth";
import { MessageResponse } from "../schema/Query";
import { fetchData } from "../utils/fetch";

const Profile = () => {
  const router = useRouter();

  const { user } = useContext(AuthContext);

  async function handleClick() {
    await fetchData<MessageResponse>({
      method: "GET",
      url: `${process.env.API_URL}/logout`,
    });
    router.reload();
  }

  return (
    <div className="flex align-middle">
      {user ? (
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-gray-600 font-medium">{user.username}</h2>
            <span className=" uppercase bg-gray-200 text-gray-600 text-xs font-semibold px-2 py-1 rounded-md">
              {user.role}
            </span>
          </div>
          <button onClick={handleClick} className="secondary-button">
            Log Out
          </button>
        </div>
      ) : (
        <div className="space-x-2">
          {router.pathname !== "/register" && (
            <Link href="/register">
              <button className="secondary-button">Register</button>
            </Link>
          )}

          {router.pathname !== "/login" && (
            <Link href="/login">
              <button className="primary-button">Login</button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
