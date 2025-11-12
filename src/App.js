import React from "react";
import { useAuth } from "react-oidc-context";

function App() {
  const auth = useAuth();

  const logoutUri = "https://main.dt99oihfbmpcm.amplifyapp.com/";
  const clientId = "58hc6tvb57fio4hlmdeht6qnu5";
  const cognitoDomain = "https://eu-north-19cwab85xs.auth.eu-north-1.amazoncognito.com";

  const signOutRedirect = () => {
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) return <div>Loading...</div>;
  if (auth.error) return <div>Error: {auth.error.message}</div>;

  if (auth.isAuthenticated) {
    return (
      <div>
        <h2>Hello, {auth.user?.profile.email}</h2>
        <p>Access Token: {auth.user?.access_token}</p>
        <button onClick={signOutRedirect}>Sign out</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome to AI Job Recommender</h1>
      <button onClick={() => auth.signinRedirect()}>Sign in</button>
    </div>
  );
}

export default App;
