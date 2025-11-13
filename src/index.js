import React from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";
import { AuthProvider } from "react-oidc-context";
import App from "./App";

// Configure Amplify
Amplify.configure(awsconfig);

const cognitoAuthConfig = {
  authority: "https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_9CwAB85xS",
  client_id: "58hc6tvb57fio4hlmdeht6qnu5",
  redirect_uri: "https://main.dt99oihfbmpcm.amplifyapp.com/",
  response_type: "code",
  scope: "email openid phone",
};

// Debug check
console.log("✅ React app loaded");

// Render
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
