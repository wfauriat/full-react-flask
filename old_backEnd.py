import numpy as np
import matplotlib.pyplot as plt
import io
import base64
import json
from django.http import JsonResponse # Simulated import

# --- The core mathematical function and plotting logic ---
def generate_sine_plot(amplitude: float):
    """
    Generates a sine wave plot based on the given amplitude and returns the 
    Base64-encoded PNG image data.

    :param amplitude: The amplitude (A) for the function y = A * sin(x).
    :return: A Base64 string of the generated plot image.
    """
    # 1. Input Validation (Simplified)
    try:
        amplitude = float(amplitude)
    except ValueError:
        return None, "Invalid amplitude provided."

    # 2. Data Generation
    x = np.linspace(0, 10 * np.pi, 500)
    y = amplitude * np.sin(x)

    # 3. Plotting with Matplotlib
    # Use a non-interactive backend
    plt.switch_backend('Agg') 
    
    # Create the figure and axes
    fig, ax = plt.subplots(figsize=(8, 4), dpi=100)
    
    # Plot the data
    ax.plot(x, y, label=f'Amplitude = {amplitude:.2f}', color='#1E40AF', linewidth=2)

    # Set titles and labels
    ax.set_title(f'Sine Wave Plot: A = {amplitude:.2f}', fontsize=14, fontweight='bold')
    ax.set_xlabel('X (radians)')
    ax.set_ylabel('Y (Amplitude)')
    ax.grid(True, linestyle='--', alpha=0.6)
    ax.legend(loc='upper right')

    # Set limits for a consistent view
    max_y = max(5, amplitude * 1.2) # Ensure graph fits even small amplitudes
    ax.set_ylim(-max_y, max_y)
    
    # Clean up layout
    plt.tight_layout()

    # 4. Save plot to a BytesIO buffer
    buffer = io.BytesIO()
    # Save the plot as PNG to the buffer
    plt.savefig(buffer, format='png')
    plt.close(fig) # Close the figure to free up memory

    # 5. Base64 Encode the PNG data
    png_data = buffer.getvalue()
    base64_encoded = base64.b64encode(png_data).decode('utf-8')

    return base64_encoded, None

# --- Simulated Django View Function ---
def sine_plot_api_view(request):
    """
    Simulated Django API view that would handle POST or GET requests
    to generate and return the plot.
    """
    # In a real Django view, you would extract 'amplitude' from request.GET or request.POST/request.data
    # We will simulate the input here:
    
    # Example: Simulating a request with an amplitude of 3.5
    try:
        # In a real view, you'd use something like request.data.get('amplitude', 1.0)
        amplitude = 3.5 
    except:
        amplitude = 1.0
        
    base64_image, error = generate_sine_plot(amplitude)

    if error:
        # return JsonResponse({'error': error}, status=400) # Django response
        print(f"Error: {error}")
        return json.dumps({'error': error}) # Simulation
    
    # return JsonResponse({'image': base64_image}) # Django response
    print("Plot successfully generated and Base64 encoded.")
    return json.dumps({'image': base64_image}) # Simulation

# Example of running the simulation (for local testing of the logic)
if __name__ == "__main__":
    print("--- Running Backend Simulation (Amplitude = 3.5) ---")
    
    # We won't print the huge Base64 string, just confirm success
    response_json = sine_plot_api_view(None) 
    response_data = json.loads(response_json)
    
    if 'image' in response_data:
        print(f"Response contains image data (first 50 chars): {response_data['image'][:50]}...")
        # Note: You would save this to a file or serve it in production.
    else:
        print(f"Response Error: {response_data['error']}")
