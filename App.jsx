import React, { useState, useEffect } from 'react';
import { Loader2, Zap, Send } from 'lucide-react'; // ADDED 'Send' icon

// The main application component
const App = () => {
  // State for GET request
  const [message, setMessage] = useState('Awaiting data from Flask API...');
  
  // State for POST request handling
  const [inputValue, setInputValue] = useState(''); // Holds user input for POST
  const [postResponse, setPostResponse] = useState(null); // Holds response from POST
  
  // General states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // NOTE: This URL must match the address and port where the Flask server is running.
  const GET_API_ENDPOINT = 'http://127.0.0.1:5000/api/message';
  // NEW ENDPOINT
  const POST_API_ENDPOINT = 'http://127.0.0.1:5000/api/post-message';

  // --- GET REQUEST LOGIC (UNCHANGED) ---
  useEffect(() => {
    // Function to fetch data from the Flask backend
    const fetchMessage = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(GET_API_ENDPOINT);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}.`);
        }

        const data = await response.json();
        setMessage(data.message || 'Error: Message field missing from API response.');
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(`Failed to connect to Flask API. Check if 'app.py' is running on port 5000.`);
        setMessage('--- Connection Failed ---');
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, []); // Empty dependency array means this effect runs only once after the initial render

  // --- NEW POST REQUEST LOGIC ---
  const handlePostMessage = async (e) => {
    e.preventDefault(); // Prevent page reload
    if (!inputValue.trim()) return; // Prevent sending empty messages

    setLoading(true);
    setPostResponse(null); // Clear previous response
    setError(null);

    try {
      const response = await fetch(POST_API_ENDPOINT, {
        method: 'POST',
        headers: {
          // IMPORTANT: Tell the server we are sending JSON
          'Content-Type': 'application/json',
        },
        // Convert the JavaScript object into a JSON string for the request body
        body: JSON.stringify({ message: inputValue }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}.`);
      }

      const data = await response.json();
      setPostResponse({
        status: data.status,
        message: data.message,
        original: data.original_message,
        error: false,
      });
      setInputValue(''); // Clear input after successful send

    } catch (err) {
      console.error("POST Error:", err);
      setPostResponse({
        status: 'error',
        message: 'Failed to send message to Flask API. Server or network issue.',
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    // Note the Inter font family defined in tailwind.config.js is applied here.
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-xl w-full transform transition duration-500 hover:shadow-2xl border border-indigo-100">
        <div className="flex items-center space-x-3 mb-6 border-b pb-4">
          <Zap className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-extrabold text-gray-800">
            Flask & React Full-Stack Demo
          </h1>
        </div>

        {/* --- GET REQUEST SECTION --- */}
        <p className="text-lg text-gray-600 mb-2 font-bold">
          1. API Polling (GET):
        </p>
        <p className="font-mono bg-gray-100 p-2 rounded-lg text-sm text-red-500 break-words mb-4 select-all">
          {GET_API_ENDPOINT}
        </p>

        <div className="border border-indigo-300 bg-indigo-50 p-4 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-indigo-800 mb-2">
            Server Status:
          </h2>
          {loading ? (
            <div className="flex items-center text-indigo-600">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Fetching Initial Data...
            </div>
          ) : error ? (
            <p className="text-red-600 font-medium p-2 bg-red-100 rounded">
              Status: <span className="font-bold">FAILED</span>
            </p>
          ) : (
            <p className="text-green-600 font-bold p-2 bg-green-100 rounded">
              Status: SUCCESS (Server is Up)
            </p>
          )}

          <h2 className="text-xl font-semibold text-indigo-800 mt-4 mb-2">
            GET Response:
          </h2>
          <p className={`text-lg font-medium p-2 border rounded ${error ? 'text-gray-500 border-gray-300 bg-white' : 'text-gray-800 border-green-300 bg-white'}`}>
            {message}
          </p>
          
          {error && (
            <p className="mt-4 text-sm text-red-700 bg-red-100 p-3 rounded">
                <span className="font-bold">Troubleshooting:</span> Ensure `app.py` is running in your terminal on port 5000.
            </p>
          )}
        </div>


        {/* --- POST REQUEST SECTION (NEW) --- */}
        <p className="text-lg text-gray-600 mb-2 font-bold">
          2. Send Data (POST):
        </p>
        <p className="font-mono bg-gray-100 p-2 rounded-lg text-sm text-red-500 break-words mb-4 select-all">
          {POST_API_ENDPOINT}
        </p>
        
        <form onSubmit={handlePostMessage} className="space-y-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message to send to Flask..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
            disabled={loading}
          />
          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 shadow-md disabled:bg-indigo-400"
            disabled={loading || !inputValue.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Send Message to Flask (POST)</span>
              </>
            )}
          </button>
        </form>

        {/* POST Response Display */}
        {postResponse && (
            <div className={`mt-6 p-4 rounded-lg border-2 ${postResponse.error ? 'border-red-400 bg-red-50' : 'border-green-400 bg-green-50'}`}>
                <h3 className="text-lg font-bold mb-2 flex items-center space-x-2">
                    {postResponse.error ? 'POST Failed' : 'POST Successful'}
                </h3>
                <p className="text-sm font-medium text-gray-700">
                    <span className="font-bold">Server Echo:</span> {postResponse.message}
                </p>
                {postResponse.original && (
                    <p className="text-xs mt-1 text-gray-500">
                        (Original message sent: "{postResponse.original}")
                    </p>
                )}
            </div>
        )}

      </div>
    </div>
  );
};

export default App;



// import React, { useState, useEffect } from 'react';
// import { Loader2, Zap } from 'lucide-react';

// // The main application component
// const App = () => {
//   // State to hold the message received from the API
//   const [message, setMessage] = useState('Awaiting data from Flask API...');
//   // State for loading indicator
//   const [loading, setLoading] = useState(false);
//   // State to handle fetch errors
//   const [error, setError] = useState(null);

//   // NOTE: This URL must match the address and port where the Flask server is running.
//   const API_ENDPOINT = 'http://127.0.0.1:5000/api/message';

//   useEffect(() => {
//     // Function to fetch data from the Flask backend
//     const fetchMessage = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         // Attempt to fetch from the Flask API endpoint
//         const response = await fetch(API_ENDPOINT);

//         if (!response.ok) {
//           // Handle HTTP errors (e.g., 404, 500)
//           throw new Error(`HTTP error! Status: ${response.status}.`);
//         }

//         const data = await response.json();
//         // Set the message state with the 'message' field from the JSON response
//         setMessage(data.message || 'Error: Message field missing from API response.');
//       } catch (err) {
//         console.error("Fetch Error:", err);
//         // If the fetch fails (e.g., network error, server is down)
//         setError(`Failed to connect to Flask API. Check if 'app.py' is running on port 5000.`);
//         setMessage('--- Connection Failed ---');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMessage();
//   }, []); // Empty dependency array means this effect runs only once after the initial render

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-inter">
//       <div className="bg-white shadow-xl rounded-xl p-8 max-w-lg w-full transform transition duration-500 hover:shadow-2xl border border-indigo-100">
//         <div className="flex items-center space-x-3 mb-6 border-b pb-4">
//           <Zap className="h-8 w-8 text-indigo-600" />
//           <h1 className="text-3xl font-extrabold text-gray-800">
//             React Frontend
//           </h1>
//         </div>

//         <p className="text-lg text-gray-600 mb-4">
//           This client-side application is calling the Flask API endpoint:
//         </p>
//         <p className="font-mono bg-gray-100 p-2 rounded-lg text-sm text-red-500 break-words mb-6 select-all">
//           {API_ENDPOINT}
//         </p>

//         <div className="border border-indigo-300 bg-indigo-50 p-4 rounded-lg">
//           <h2 className="text-xl font-semibold text-indigo-800 mb-2">
//             Connection Status:
//           </h2>
//           {loading ? (
//             <div className="flex items-center text-indigo-600">
//               <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//               Fetching data...
//             </div>
//           ) : error ? (
//             <p className="text-red-600 font-medium p-2 bg-red-100 rounded">
//               Status: <span className="font-bold">FAILED</span>
//             </p>
//           ) : (
//             <p className="text-green-600 font-bold p-2 bg-green-100 rounded">
//               Status: SUCCESS
//             </p>
//           )}

//           <h2 className="text-xl font-semibold text-indigo-800 mt-4 mb-2">
//             Server Response:
//           </h2>
//           <p className={`text-lg font-medium p-2 border rounded ${error ? 'text-gray-500 border-gray-300 bg-white' : 'text-gray-800 border-green-300 bg-white'}`}>
//             {message}
//           </p>
          
//           {error && (
//             <p className="mt-4 text-sm text-red-700 bg-red-100 p-3 rounded">
//                 <span className="font-bold">Troubleshooting:</span> Ensure you have Python, Flask, and flask-cors installed, and that `app.py` is running in your terminal on port 5000.
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;