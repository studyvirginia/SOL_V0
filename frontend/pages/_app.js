import "../styles/globals.css";
import "katex/dist/katex.min.css";
import { AuthProvider } from "../lib/authContext";

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
