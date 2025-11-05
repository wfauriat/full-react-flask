import React, { useState, useCallback } from 'react';
import { LineChart, Zap, Loader2 } from 'lucide-react';

// Mock Base64 image data for a simple blue sine wave (to simulate the API response)
// In a real app, this would be the data returned from the Python API
const MOCK_BASE64_IMAGE = "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAB" + 
    "NUlEQVR4nO3BMQEAAADCoPVPbQhfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAgABH/QABK9d+LAAAAAElFTkSuQmCC"; 
// Note: This specific mock string is just a tiny, invisible 1x1 image placeholder due to file size limits. 
// A real Matplotlib image would be significantly longer. We rely on the logic below.

const API_ENDPOINT = '/api/generate-plot/'; // The endpoint we would call in a real app

// --- Utility for Exponential Backoff (Optional but good practice for API calls) ---
const exponentialBackoffFetch = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      throw new Error(`HTTP Error: ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      const delay = Math.pow(2, i) * 1000;
      console.warn(`Request failed, retrying in ${delay}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const App = () => {
  const [amplitude, setAmplitude] = useState(1.0);
  const [imageData, setImageData] = useState(null); // Stores the Base64 image string
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGeneratePlot = useCallback(async () => {
    setLoading(true);
    setError(null);
    setImageData(null);

    // --- MOCK API CALL SIMULATION ---
    console.log(`Simulating POST request to ${API_ENDPOINT} with amplitude: ${amplitude}`);
    
    // In a REAL application, you would use:
    /*
    try {
      const response = await exponentialBackoffFetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amplitude: parseFloat(amplitude) }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else if (data.image) {
        setImageData(data.image);
      } else {
        setError("API returned an unexpected response.");
      }

    } catch (err) {
      setError(`Failed to connect to backend: ${err.message}. Is the Django server running?`);
    } finally {
      setLoading(false);
    }
    */
    
    // --- MOCK RESPONSE FOR CANVAS ENVIRONMENT ---
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    // If the amplitude is 0, simulate an error from the backend
    if (parseFloat(amplitude) <= 0) {
      setError("The backend requires a positive amplitude for the plot.");
      setLoading(false);
      return;
    }
    
    // Use the mock image data to demonstrate the rendering logic
    // NOTE: In a production app, the Python backend would generate the actual image data.
    setImageData(MOCK_BASE64_IMAGE);
    setLoading(false);

  }, [amplitude]);

  const imageUrl = imageData ? `data:image/png;base64,${imageData}` : null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <script src="https://cdn.tailwindcss.com"></script>
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-blue-900 flex items-center justify-center">
            <LineChart className="w-8 h-8 mr-3 text-blue-600" />
            React + Django Matplotlib Plotter
          </h1>
          <p className="text-gray-600 mt-2">
            Control the Matplotlib backend from the React frontend.
          </p>
        </header>

        <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-indigo-500" />
            Function Control
          </h2>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-center">
            <div className="flex-1 w-full">
              <label htmlFor="amplitude" className="block text-sm font-medium text-gray-700 mb-1">
                Sine Wave Amplitude (A)
              </label>
              <input
                id="amplitude"
                type="number"
                step="0.1"
                min="0.1"
                value={amplitude}
                onChange={(e) => setAmplitude(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                placeholder="e.g., 2.5"
                aria-describedby="amplitude-help"
              />
              <p id="amplitude-help" className="mt-1 text-sm text-gray-500">
                Sets 'A' in the function: $Y = A \cdot \sin(X)$
              </p>
            </div>
            <button
              onClick={handleGeneratePlot}
              disabled={loading}
              className={`w-full sm:w-auto mt-6 sm:mt-0 px-6 py-3 rounded-lg text-white font-bold transition duration-300 transform shadow-md 
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
                } flex items-center justify-center`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Plot...
                </>
              ) : (
                <>
                  Generate Plot
                </>
              )}
            </button>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Plot Visualization (Received from Backend)
          </h2>
          
          {error && (
            <div className="p-4 bg-red-100 text-red-700 border-l-4 border-red-500 rounded-lg mb-4" role="alert">
              <p className="font-bold">Error from API:</p>
              <p>{error}</p>
              <p className="text-sm mt-1">
                *Note: This is a simulated environment. Check the console for full details.*
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
              <p className="text-lg text-gray-600">Waiting for Plot Data from Django API...</p>
            </div>
          )}

          {imageUrl && !loading && (
            <div className="relative border-2 border-dashed border-gray-300 p-2 rounded-lg bg-gray-50">
              {/* The image src is a data URL containing the base64-encoded PNG from Matplotlib */}
              <img
                src={imageUrl}
                alt={`Sine Wave Plot with Amplitude ${amplitude}`}
                className="w-full h-auto rounded-md shadow-md"
                // Fallback for when the image data is invalid (in this mock case)
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = "https://placehold.co/800x400/eeeeee/333333?text=PLOT+IMAGE+PLACEHOLDER";
                  setError("Error rendering Base64 image. Check backend encoding.");
                }}
              />
              <p className="text-center text-sm text-gray-500 mt-2">
                Plot rendered from Base64 data received from the Python backend.
              </p>
            </div>
          )}

          {!imageData && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg border border-dashed border-gray-400">
                <LineChart className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-lg text-gray-500">Click "Generate Plot" to request visualization from Python backend.</p>
            </div>
          )}

        </section>

        <footer className="mt-8 text-center text-sm text-gray-500">
            <p>Architecture: React (Frontend UI) &lt;-- API Call --&gt; Django/Python (Matplotlib Plotting)</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
