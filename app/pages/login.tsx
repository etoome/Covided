import { useState } from "react";

import { useRouter } from "next/router";

import Layout from "../components/Layout";
import { fetchData } from "../utils/fetch";
import { MessageResponse } from "../schema/Query";

const Login = () => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const router = useRouter();
  const next = (router.query?.next as string) || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetchData<MessageResponse>({
      method: "POST",
      url: `${process.env.API_URL}/login`,
      body: {
        username,
        password,
      },
    });

    if (res.status === 200) {
      router.push(next);
    } else {
      if (res.status === 500) {
        setError(`API error`);
        return;
      }
      setError(res.data?.message || `Error ${res.status}`);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="shadow overflow-hidden sm:rounded-md px-4 py-5 bg-white sm:p-6">
            <div className="m-6">
              <h2 className="text-center text-3xl font-extrabold text-gray-900">
                Login
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="username">Username</label>
                  <input
                    id="username"
                    type="text"
                    required
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Username"
                  />
                </div>

                <div>
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="relative w-full flex justify-center primary-button"
                >
                  Login
                </button>
              </div>

              {error && (
                <div className="flex justify-center text-sm">
                  <p className="error-message">{error}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
