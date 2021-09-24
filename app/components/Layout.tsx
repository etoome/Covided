import React from "react";
import Link from "next/link";
import Profile from "./Profile";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex flex-col min-h-screen justify-between">
        <div className="flex justify-between items-center border-b-2 border-gray-100 py-4">
          <nav className="flex justify-start">
            <Link href="/dashboard">
              <a className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md font-medium">
                Dashboard
              </a>
            </Link>

            <Link href="/request">
              <a className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md font-medium">
                Request
              </a>
            </Link>
          </nav>

          <div className="flex justify-end items-center ">
            <Profile />
          </div>
        </div>

        <main>{children}</main>

        <footer>
          <div className="flex justify-center p-2">
            <Link href="https://progiciel.be">
              <a
                target="_blank"
                className="text-gray-500 hover:text-gray-600 font-semibold text-sm"
              >
                Progiciel © 2021
              </a>
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
