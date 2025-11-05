import React, { useState, useEffect } from 'react';
import { Loader2, Zap, Send, ListPlus, CheckSquare } from 'lucide-react'; 

// The main application component
const App = () => {
  // State for initial GET request (status check)
  const [initialMessage, setInitialMessage] = useState('Awaiting status check from Flask API...');
  
  // State for ToDo List
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState(''); 
  
  // General states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // API Endpoints
  const STATUS_API_ENDPOINT = 'http://127.0.0.1:5000/api/message';
  const TODOS_API_ENDPOINT = 'http://127.0.0.1:5000/api/todos';

  // --- 1. INITIAL STATUS CHECK (GET) ---
  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(STATUS_API_ENDPOINT);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}.`);
        }

        const data = await response.json();
        setInitialMessage(data.message || 'Error: Message field missing from API response.');
      } catch (err) {
        console.error("Status Fetch Error:", err);
        setError(`Failed to connect to Flask API. Check if 'app.py' is running on port 5000.`);
        setInitialMessage('--- Connection Failed ---');
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []); 

  // --- 2. FETCH TODO LIST (GET) ---
  const fetchTodos = async () => {
    try {
        const response = await fetch(TODOS_API_ENDPOINT);
        if (!response.ok) {
          throw new Error(`Failed to fetch todos: ${response.status}`);
        }
        const data = await response.json();
        // Sort by ID to ensure proper display order since DESC is used in SQL
        setTodos(data); 
    } catch (err) {
        console.error("ToDo Fetch Error:", err);
        setError(`Failed to load To-Dos. Is the database initialized?`);
    }
  };

  // Fetch todos on component mount
  useEffect(() => {
    // Only fetch todos if initial status check was successful (no major errors)
    if (!error) {
        fetchTodos();
    }
  }, [error]); 

  // --- 3. ADD NEW TODO (POST) ---
  const handleAddTodo = async (e) => {
    e.preventDefault(); 
    if (!newTodoText.trim()) return;

    setIsSending(true);
    try {
      const response = await fetch(TODOS_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newTodoText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}.`);
      }

      // After successful addition, clear the input and refresh the list
      setNewTodoText('');
      await fetchTodos();

    } catch (err) {
      console.error("POST Error:", err);
      setError('Failed to add To-Do item. Network or API issue.');
    } finally {
      setIsSending(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-xl w-full border border-indigo-100">
        
        <div className="flex items-center space-x-3 mb-6 border-b pb-4">
          <Zap className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-extrabold text-gray-800">
            Full-Stack To-Do List (Flask & SQLite)
          </h1>
        </div>

        {/* --- STATUS CHECK SECTION --- */}
        <p className="text-lg text-gray-600 mb-2 font-bold">
          1. Initial Server Status:
        </p>
        <div className="border border-indigo-300 bg-indigo-50 p-4 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-indigo-800 mb-2">
            Status Endpoint: {STATUS_API_ENDPOINT}
          </h2>
          {loading ? (
            <div className="flex items-center text-indigo-600">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Checking server...
            </div>
          ) : error ? (
            <p className="text-red-600 font-medium p-2 bg-red-100 rounded">
              Status: <span className="font-bold">FAILED</span>
            </p>
          ) : (
            <p className="text-green-600 font-bold p-2 bg-green-100 rounded">
              Status: SUCCESS ({initialMessage})
            </p>
          )}
        </div>


        {/* --- TODO LIST INTERFACE --- */}
        <p className="text-lg text-gray-600 mb-2 font-bold">
          2. Persistent To-Do List:
        </p>
        <p className="font-mono bg-gray-100 p-2 rounded-lg text-sm text-red-500 break-words mb-4 select-all">
          API Endpoint: {TODOS_API_ENDPOINT} (Handles GET & POST)
        </p>
        
        {/* Input Form */}
        <form onSubmit={handleAddTodo} className="flex space-x-2 mb-6">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
            disabled={isSending}
          />
          <button
            type="submit"
            className="flex items-center space-x-2 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 shadow-md disabled:bg-indigo-400"
            disabled={isSending || !newTodoText.trim()}
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ListPlus className="h-5 w-5" />
            )}
            <span>Add</span>
          </button>
        </form>

        {/* ToDo List Display */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-inner min-h-[100px]">
            {error ? (
                <p className="text-red-600 p-2 text-center">{error}</p>
            ) : todos.length === 0 ? (
                <p className="text-gray-500 p-2 text-center">No to-do items yet. Add one above!</p>
            ) : (
                <ul className="space-y-2">
                    {todos.map((todo) => (
                        <li 
                            key={todo.id} 
                            className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-sm transition"
                        >
                            <CheckSquare className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                            <span className="text-gray-800 break-words flex-grow">{todo.text}</span>
                            <span className="text-xs text-gray-400 ml-4 flex-shrink-0">ID: {todo.id}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>
    </div>
  );
};

export default App;