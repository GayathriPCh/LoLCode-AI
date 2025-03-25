"use client";
import { useState, useRef, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter" ;
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { auth } from "../firebase"; // Import Firebase auth
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation"; // Next.js navigation
import { User } from "firebase/auth"; // Ensure User type is imported

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [persona,setPersona] = useState("LeetGuru"); // Default persona

  const [user, setUser] = useState<User | null>(null); // Track logged-in user
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter(); // Next.js navigation

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

    // Check auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // User is logged in
      } else {
        setUser(null); // User is logged out
      }
    });

    return () => unsubscribe();
  }, [messages]);

  // Handle Sign In
  const handleSignIn = async () => {
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
    } catch {
      setError("Invalid email or password");
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    await signOut(auth);
  };

  // Handles API calls for chat, debug, or roast
  const sendMessage = async (mode: "chat" | "debug" | "roast") => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    let prompt = input;
    if (mode === "debug") {
      prompt = `Debug this code thoroughly and find all possible issues:\n\n${input}`;
    } else if (mode === "roast") {
      prompt = `Roast this code in the style of ${persona}:\n\n${input}`;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: prompt }],
          persona, // ✅ Send persona from dropdown
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.choices[0]?.message?.content || "No response 🤔" },
      ]);
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Bruh, API just crashed. 🫠" }]);
    }
  };

  // ✅ Proper Markdown Support (Handles Code Blocks, Inline Code, and Lists)
  const renderMessage = (message: string) => {
    return (
      <div className="prose prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter style={oneDark} language={match[1]} {...props}>
                  {String(children).trim()}
                </SyntaxHighlighter>
              ) : (
                <code className="bg-gray-700 p-1 rounded" {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {message}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold">LOLCode AI</h1>
      <p className="text-lg text-gray-400 mb-4">Because Your Code Deserves Brutal Honesty & Smart Fixes.</p>

      {/* ✅ Sign In / Sign Up Section */}
      <div className="mb-6">
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-green-400">Welcome, {user.email}!</span>
            <button className="bg-red-500 px-4 py-2 rounded-lg" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 bg-gray-700 text-white border border-gray-600 rounded-lg"
              placeholder="Email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 bg-gray-700 text-white border border-gray-600 rounded-lg"
              placeholder="Password"
            />
            {error && <p className="text-red-400">{error}</p>}
            <button className="bg-blue-500 px-4 py-2 rounded-lg" onClick={handleSignIn}>
              Sign In
            </button>
            <button className="bg-yellow-500 px-4 py-2 rounded-lg" onClick={() => router.push("/signup")}>
              Sign Up
            </button>
          </div>
        )}
      </div>

      {/* Chat Box */}
      <div className="w-full max-w-lg space-y-4">
        <div className="bg-gray-800 p-4 rounded-lg h-96 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={msg.role === "user" ? "text-right text-blue-400" : "text-left text-green-400"}>
              {renderMessage(msg.content)}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input & Buttons */}
        <div className="flex gap-2">
          <input
            className="flex-1 p-2 bg-gray-700 text-white border border-gray-600 rounded-lg"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your code here..."
          />
          <button className="bg-blue-500 px-4 py-2 rounded-lg" onClick={() => sendMessage("chat")}>
            Send
          </button>
          <button className="bg-red-500 px-4 py-2 rounded-lg" onClick={() => sendMessage("debug")}>
            Debug
          </button>
        </div>

        {/* Persona Dropdown & Roast Button */}
        <div className="flex gap-2">
          <select
            className="p-2 bg-gray-700 text-white border border-gray-600 rounded-lg"
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
          >
            <option value="LeetGuru">LeetGuru 🧘‍♂️</option>
            <option value="BugFather">BugFather 🔥</option>
            <option value="FAANG Interviewer">FAANG Interviewer 🏢</option>
            <option value="Meme Lord">Meme Lord 😂</option>
          </select>
          <button className="bg-yellow-500 px-4 py-2 rounded-lg" onClick={() => sendMessage("roast")}>
            Roast My Code
          </button>
        </div>
      </div>
    </div>
  );
}
