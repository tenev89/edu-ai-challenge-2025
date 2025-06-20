# Audio Transcription, Summarization, and Analysis Application

This console application transcribes a given audio file, provides a summary of the transcription, and extracts analytical data such as word count, speaking speed, and frequently mentioned topics.

## Prerequisites

- Python 3.7+
- An OpenAI API key

## Setup

1.  **Clone the repository or download the files.**

2.  **Navigate to the `Task 11` directory:**
    ```bash
    cd "Task 11"
    ```

3.  **Install the required Python packages:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up your OpenAI API Key:**
    Create a file named `.env` in the `Task 11` directory. Add your OpenAI API key to this file as follows:
    ```
    OPENAI_API_KEY=your_openai_api_key_here
    ```
    Replace `your_openai_api_key_here` with your actual OpenAI API key.

## How to Run the Application

Execute the `main.py` script from your terminal, passing the path to the audio file you want to process as a command-line argument.

**Syntax:**
```bash
python main.py <path_to_your_audio_file>
```

**Example:**
```bash
python main.py CAR0004.mp3
```

## Output

The application will perform the following actions:

1.  **Print to Console:** The summary and analytics will be displayed directly in your console window.
2.  **Generate Files:** It will create the following files in the `Task 11` directory:
    -   `transcription.md`: The full text transcribed from the audio file.
    -   `summary.md`: A concise summary of the transcription.
    -   `analysis.json`: A JSON object containing the analytical data. 