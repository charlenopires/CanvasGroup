'use client';

import { useState } from 'react';

export default function TestAuthPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const addResult = (text: string) => {
    setResult(prev => prev + '\n' + text);
  };

  const testLoginGET = async () => {
    setLoading(true);
    setResult('Testing Login GET...');

    try {
      const response = await fetch('/api/auth/login');
      const headers = Object.fromEntries(response.headers.entries());
      const text = await response.text();
      setResult(`GET /api/auth/login\nStatus: ${response.status}\nHeaders: ${JSON.stringify(headers, null, 2)}\nBody: ${text}`);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testLoginPOST = async () => {
    setLoading(true);
    setResult('Testing Login POST...');

    try {
      const body = {
        firebaseUid: 'browser-test-' + Date.now(),
        email: 'browsertest@example.com',
        displayName: 'Browser Test',
        photoURL: null,
      };

      addResult(`Request body: ${JSON.stringify(body)}`);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const headers = Object.fromEntries(response.headers.entries());
      addResult(`Status: ${response.status}`);
      addResult(`Response headers: ${JSON.stringify(headers, null, 2)}`);

      const text = await response.text();
      addResult(`Response body (${text.length} chars): ${text}`);
    } catch (error) {
      addResult(`Error: ${error instanceof Error ? error.stack : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testHealth = async () => {
    setLoading(true);
    setResult('Testing health...');

    try {
      const response = await fetch('/api/health');
      const text = await response.text();
      setResult(`Status: ${response.status}\nBody: ${text}`);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testSimplePOST = async () => {
    setLoading(true);
    setResult('Testing simple POST to /api/test...');

    try {
      const body = { test: 'data', timestamp: Date.now() };
      addResult(`Request body: ${JSON.stringify(body)}`);

      const response = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const text = await response.text();
      addResult(`Status: ${response.status}`);
      addResult(`Body: ${text}`);
    } catch (error) {
      addResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>

      <div className="flex flex-wrap gap-4 mb-4">
        <button
          onClick={testHealth}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Health Check
        </button>
        <button
          onClick={testSimplePOST}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test POST
        </button>
        <button
          onClick={testLoginGET}
          disabled={loading}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          Login GET
        </button>
        <button
          onClick={testLoginPOST}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Login POST
        </button>
      </div>

      <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap text-sm font-mono max-h-96 overflow-auto">
        {result || 'Click a button to test'}
      </pre>
    </div>
  );
}
