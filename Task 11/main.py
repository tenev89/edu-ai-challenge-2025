import openai
import os
import json
import argparse
from dotenv import load_dotenv
from mutagen.mp3 import MP3

def get_audio_duration(file_path):
    try:
        audio = MP3(file_path)
        return audio.info.length
    except Exception as e:
        print(f"Error getting audio duration: {e}")
        return None

def transcribe_audio(file_path):
    if not os.path.exists(file_path):
        return "Error: Audio file not found."

    try:
        with open(file_path, "rb") as audio_file:
            transcript = openai.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="text"
            )
        return transcript
    except Exception as e:
        return f"Error during transcription: {e}"

def summarize_text(text):
    try:
        response = openai.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that summarizes text."},
                {"role": "user", "content": f"Please summarize the following text:\n\n{text}"}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error during summarization: {e}"

def analyze_text(text, duration_seconds):
    word_count = len(text.split())
    
    if duration_seconds and duration_seconds > 0:
        speaking_speed_wpm = round((word_count / duration_seconds) * 60)
    else:
        speaking_speed_wpm = 0

    try:
        response = openai.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "You are an assistant that analyzes text. Extract the most frequently mentioned topics and their mention count from the text. Respond with only a JSON object containing a list of topics and their counts, like this: {\"topics\": [{\"topic\": \"Name\", \"mentions\": 4}]}"},
                {"role": "user", "content": f"Extract the frequently mentioned topics from this text:\n\n{text}"}
            ]
        )
        # The response from the API is a string that looks like a JSON.
        # We need to parse it to get the actual JSON object.
        topics_data = json.loads(response.choices[0].message.content)
        frequently_mentioned_topics = topics_data.get("topics", [])
    except Exception as e:
        print(f"Error extracting topics: {e}")
        frequently_mentioned_topics = []

    analysis = {
        "word_count": word_count,
        "speaking_speed_wpm": speaking_speed_wpm,
        "frequently_mentioned_topics": frequently_mentioned_topics
    }
    
    return analysis

def main():
    parser = argparse.ArgumentParser(description="Transcribe, summarize, and analyze an audio file.")
    parser.add_argument("audio_file", help="Path to the audio file to process.")
    args = parser.parse_args()

    load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("Error: OPENAI_API_KEY not found. Please set it in your environment or a .env file.")
        return
    openai.api_key = api_key

    file_path = args.audio_file
    
    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)

    print(f"Processing {file_path}...")

    # 1. Transcribe
    print("Transcribing audio...")
    transcription = transcribe_audio(file_path)
    if "Error" in transcription:
        print(transcription)
        return

    transcription_filename = os.path.join(output_dir, "transcription.md")
    with open(transcription_filename, "w", encoding="utf-8") as f:
        f.write(transcription)
    print(f"Transcription saved to {transcription_filename}")

    # 2. Get audio duration
    duration = get_audio_duration(file_path)

    # 3. Analyze
    print("Analyzing text...")
    analysis = analyze_text(transcription, duration)
    analysis_filename = os.path.join(output_dir, "analysis.json")
    with open(analysis_filename, "w", encoding="utf-8") as f:
        json.dump(analysis, f, indent=2)
    print(f"Analysis saved to {analysis_filename}")

    # 4. Summarize
    print("Summarizing text...")
    summary = summarize_text(transcription)
    summary_filename = os.path.join(output_dir, "summary.md")
    with open(summary_filename, "w", encoding="utf-8") as f:
        f.write(summary)
    print(f"Summary saved to {summary_filename}")

    # 5. Output to console
    print("\n--- Summary ---")
    print(summary)
    print("\n--- Analysis ---")
    print(json.dumps(analysis, indent=2))

if __name__ == "__main__":
    main() 