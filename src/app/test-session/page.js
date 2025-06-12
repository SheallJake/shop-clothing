"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageTransition from "@/components/PageTransition";

export default function TestSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenDetails, setTokenDetails] = useState(null);
  const [fullToken, setFullToken] = useState(null);
  const [error, setError] = useState(null);

  // Sample JWT token for demonstration
  const sampleToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTYiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTcwOTc2NDgwMCwiZXhwIjoxNzA5ODUxMjAwfQ.8tGcHYZxX4bV1KJ9LmN2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J2K3";

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    }
    return null;
  };

  const checkSession = async () => {
    try {
      setError(null);
      const response = await fetch("/api/session");
      const data = await response.json();
      setSession(data);

      // Get token from cookies using the helper function
      const token = getCookie("token");
      console.log("Session data:", data); // Debug log
      console.log("Cookie token:", token); // Debug log

      if (token) {
        setFullToken(token);
        inspectToken(token);
      } else {
        console.log("No token found in cookies"); // Debug log
        setTokenDetails(null);
        setFullToken(null);
      }
    } catch (error) {
      console.error("Session check failed:", error);
      setError("Failed to check session");
      toast.error("Failed to check session");
    } finally {
      setLoading(false);
    }
  };

  const inspectToken = (token) => {
    try {
      console.log("Inspecting token:", token); // Debug log

      // Split the token into parts
      const [header, payload, signature] = token.split(".");

      if (!header || !payload || !signature) {
        throw new Error("Invalid token format");
      }

      // Decode the parts
      const decodedHeader = JSON.parse(atob(header));
      const decodedPayload = JSON.parse(atob(payload));

      // Calculate expiration time
      const expirationDate = new Date(decodedPayload.exp * 1000);
      const isExpired = expirationDate < new Date();

      setTokenDetails({
        header: decodedHeader,
        payload: decodedPayload,
        signature: signature,
        expiration: {
          date: expirationDate.toLocaleString(),
          isExpired,
          timeRemaining: isExpired
            ? "Expired"
            : `${Math.floor(
                (expirationDate - new Date()) / 1000 / 60
              )} minutes remaining`,
        },
      });
    } catch (error) {
      console.error("Token inspection failed:", error);
      setError("Invalid token format");
      setTokenDetails(null);
    }
  };

  const testLogin = async () => {
    try {
      setError(null);
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "123123@gmail.com",
          password: "12345678F",
        }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success("Успішний вхід");
        // Wait a bit for the cookie to be set
        setTimeout(checkSession, 500);
      } else {
        setError(data.error || "Помилка входу");
        toast.error(data.error || "Помилка входу");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("Помилка входу");
      toast.error("Помилка входу");
    }
  };

  const testLogout = async () => {
    try {
      setError(null);
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Успішний вихід");
        setSession(null);
        setTokenDetails(null);
        setFullToken(null);
      } else {
        setError("Помилка виходу");
        toast.error("Помилка виходу");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      setError("Помилка виходу");
      toast.error("Помилка виходу");
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <PageTransition>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Тест JWT сесії</h1>

        {/* Current Session Token */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Поточний токен сесії:</h2>
          {error && (
            <div className="mb-4 p-4 bg-red-900 rounded text-white">
              Помилка: {error}
            </div>
          )}
          {fullToken ? (
            <div className="space-y-2">
              <div className="bg-gray-900 p-4 rounded">
                <p className="text-sm font-mono break-all text-gray-300">
                  {fullToken}
                </p>
              </div>
              <div className="text-sm text-gray-400">
                Токен присутній та дійсний
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="bg-gray-900 p-4 rounded">
                <p className="text-sm font-mono text-gray-500">
                  Немає активного токену сесії
                </p>
              </div>
              <div className="text-sm text-gray-400">
                {session?.user
                  ? "Сесія існує, але токен не знайдено"
                  : "Будь ласка, увійдіть, щоб побачити токен сесії"}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={testLogin}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Test Login
            </button>
            <button
              onClick={testLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Test Logout
            </button>
            <button
              onClick={checkSession}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Check Session
            </button>
          </div>

          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Session Status:</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <pre className="bg-gray-800 p-4 rounded overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            )}
          </div>

          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">JWT Token Structure:</h2>
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded">
                <p className="text-sm font-mono break-all">
                  <span className="text-blue-400">
                    {sampleToken.split(".")[0]}
                  </span>
                  <span className="text-gray-400">.</span>
                  <span className="text-green-400">
                    {sampleToken.split(".")[1]}
                  </span>
                  <span className="text-gray-400">.</span>
                  <span className="text-purple-400">
                    {sampleToken.split(".")[2]}
                  </span>
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-blue-400">
                    Header:
                  </h3>
                  <pre className="bg-gray-800 p-4 rounded overflow-auto">
                    {JSON.stringify(
                      {
                        alg: "HS256",
                        typ: "JWT",
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-green-400">
                    Payload:
                  </h3>
                  <pre className="bg-gray-800 p-4 rounded overflow-auto">
                    {JSON.stringify(
                      {
                        userId: "123456",
                        email: "test@example.com",
                        role: "USER",
                        iat: 1709764800,
                        exp: 1709851200,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-purple-400">
                    Signature:
                  </h3>
                  <pre className="bg-gray-800 p-4 rounded overflow-auto">
                    {
                      "HMACSHA256(\n  base64UrlEncode(header) + '.' +\n  base64UrlEncode(payload),\n  secret\n)"
                    }
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {tokenDetails && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Token Details:</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Header:</h3>
                  <pre className="bg-gray-800 p-4 rounded overflow-auto">
                    {JSON.stringify(tokenDetails.header, null, 2)}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Payload:</h3>
                  <pre className="bg-gray-800 p-4 rounded overflow-auto">
                    {JSON.stringify(tokenDetails.payload, null, 2)}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Signature:</h3>
                  <pre className="bg-gray-800 p-4 rounded overflow-auto">
                    {tokenDetails.signature}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Expiration:</h3>
                  <div
                    className={`p-4 rounded ${
                      tokenDetails.expiration.isExpired
                        ? "bg-red-900"
                        : "bg-green-900"
                    }`}
                  >
                    <p>Expires: {tokenDetails.expiration.date}</p>
                    <p>Status: {tokenDetails.expiration.timeRemaining}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
