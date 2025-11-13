import React, { useState } from "react";
import { LexRuntimeV2Client, RecognizeTextCommand } from "@aws-sdk/client-lex-runtime-v2";
import { currentAuthenticatedUser, currentCredentials } from "@aws-amplify/auth"; // updated imports
import "./LexChatbot.css";

const LexChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const lexClient = new LexRuntimeV2Client({ region: "eu-north-1" });

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Get AWS credentials for the current authenticated user
      const credentials = await currentCredentials(); 
      const identityId = credentials.identityId; // unique session ID

      const command = new RecognizeTextCommand({
        botId: "9UOG60STH7",       // <-- replace with your botId
        botAliasId: "TSTALIASID",  // <-- replace with your botAliasId
        localeId: "en_US",
        sessionId: identityId,
        text: input,
      });

      const response = await lexClient.send(command);
      const reply = response.messages?.[0]?.content || "Sorry, I didn’t understand that.";
      setMessages([...newMessages, { from: "bot", text: reply }]);
    } catch (error) {
      console.error("Lex Error:", error);
      setMessages([...newMessages, { from: "bot", text: "Error contacting Lex bot." }]);
    }

    setLoading(false);
  };

  return (
    <div className="chatbot-container">
      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.from === "user" ? "user-msg" : "bot-msg"}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about your career..."
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default LexChatbot;
