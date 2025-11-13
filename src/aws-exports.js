const awsmobile = {
    // 🔹 AWS Region Configuration
    aws_project_region: "eu-north-1",

    // 🔹 Cognito Authentication Settings
    aws_cognito_region: "eu-north-1",
    aws_user_pools_id: "eu-north-1_9CwAB85xS",
    aws_user_pools_web_client_id: "58hc6tvb57fio4hlmdeht6qnu5",
    oauth: {
        domain: "eu-north-19cwab85xs.auth.eu-north-1.amazoncognito.com",
        scope: ["email", "openid", "phone"],
        redirectSignIn: "https://main.dt99oihfbmpcm.amplifyapp.com/",
        redirectSignOut: "https://main.dt99oihfbmpcm.amplifyapp.com/",
        responseType: "code",
    },

    // 🔹 Lex Chatbot Integration (Amazon Lex V2)
    aws_lex: {
        botName: "CareerBot",          // ✅ Your Lex bot name
        botAlias: "TestBotAlias",      // ✅ The alias of your bot
        botRegion: "eu-north-1",       // ✅ Lex region
        initialText: "Hi! I’m CareerBot — here to help you find the best job roles. How can I assist today?",
        initialSpeechInstruction: "Say hello to get started!",
    },

    // 🔹 Identity Pool (Cognito Federated Identities)
    aws_cognito_identity_pool_id: "eu-north-1:02c7e1fa-ae05-4714-82e8-a50bfb76d688",
};

export default awsmobile;
