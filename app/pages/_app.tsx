import App from "next/app";
import type { AppContext, AppProps } from "next/app";
import { AuthContext } from "../providers/Auth";
import { Token } from "../schema/Token";

import "../styles/globals.css";
import cookies from "next-cookies";
import jwtDecode from "jwt-decode";

interface Props extends AppProps {
  user: Token;
}

function CustomApp({ Component, pageProps, user }: Props) {
  return (
    <AuthContext.Provider value={{ user }}>
      <div className="min-h-screen bg-gray-50 font-open-sans">
        <Component {...pageProps} />
      </div>
    </AuthContext.Provider>
  );
}

CustomApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);

  const { auth } = cookies(appContext.ctx);

  if (auth) {
    const decoded: Token = jwtDecode(auth);
    return { ...appProps, user: decoded };
  }

  return { ...appProps };
};

export default CustomApp;
