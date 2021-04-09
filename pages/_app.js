import "../styles/app.css";
import firebase, { FirebaseContext } from "../firebase";
import useAutenticación from "../hooks/useAutenticación";


function MyApp({ Component, pageProps }) {
  const usuario = useAutenticación();
  return (
    <FirebaseContext.Provider
      value={{
        firebase,
        usuario
      }}
    >
      <Component {...pageProps} />
    </FirebaseContext.Provider>
  );
}

export default MyApp;

// return <Component {...pageProps} />;