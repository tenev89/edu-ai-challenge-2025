import os
import openai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

API_KEY = os.getenv('OPENAI_API_KEY')
if not API_KEY:
    print("[ERROR] OpenAI API key not found. Please set OPENAI_API_KEY in your .env file.")
    exit(1)

client = openai.OpenAI(api_key=API_KEY)

PROMPT_TEMPLATE = '''You are an expert product analyst. Given the following service or product description, generate a comprehensive markdown report with the following sections:

1. **Brief History**: Founding year, major milestones, and evolution.
2. **Target Audience**: Who primarily uses this service?
3. **Core Features**: List the top 2–4 key functionalities.
4. **Unique Selling Points**: What makes this service stand out?
5. **Business Model**: How does the service make money?
6. **Tech Stack Insights**: Any known or likely technologies used.
7. **Perceived Strengths**: What are the main positives or standout features?
8. **Perceived Weaknesses**: Any cited drawbacks or limitations.

Respond in clear, well-structured markdown. Here is the input:
"""
{input_text}
"""
'''

def get_user_input():
    print("Enter a known service name (e.g., 'Spotify') or paste a product/service description. Press Enter when done:")
    lines = []
    while True:
        try:
            line = input()
            if line.strip() == '' and lines:
                break
            lines.append(line)
        except EOFError:
            break
    return '\n'.join(lines).strip()

def generate_report(input_text):
    prompt = PROMPT_TEMPLATE.format(input_text=input_text)
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=900,
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[ERROR] Failed to generate report: {e}")
        return None

def main():
    user_input = get_user_input()
    if not user_input:
        print("[ERROR] No input provided.")
        return
    print("\n[INFO] Generating report...\n")
    report = generate_report(user_input)
    if report:
        print(report)
        save = input("\nDo you want to save the report to a file? (y/n): ").strip().lower()
        if save == 'y':
            filename = input("Enter filename (e.g., report.md): ").strip()
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(report)
            print(f"[INFO] Report saved to {filename}")

if __name__ == "__main__":
    main() 