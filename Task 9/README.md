# AI Service/Product Analyzer Console App

This is a lightweight Python console application that generates a comprehensive, markdown-formatted report about a digital service or product from multiple perspectives (business, technical, user-focused) using the OpenAI API.

## Features
- Accepts either a known service name (e.g., "Spotify") or a raw service description as input
- Returns a multi-section markdown report including:
  - Brief History
  - Target Audience
  - Core Features
  - Unique Selling Points
  - Business Model
  - Tech Stack Insights
  - Perceived Strengths
  - Perceived Weaknesses
- Outputs the report in the terminal and optionally saves it to a file

## Setup Instructions

### 1. Clone the repository
```
git clone <your-repo-url>
cd <your-repo-directory>
```

### 2. Install Python dependencies
Make sure you have Python 3.8+ installed.
```
pip install -r requirements.txt
```

### 3. Set your OpenAI API key
- Copy `.env.example` to `.env`:
  ```
  cp .env.example .env
  ```
- Edit `.env` and paste your OpenAI API key:
  ```
  OPENAI_API_KEY=sk-...
  ```

**Never commit your real API key to any public repository!**

### 4. Run the application
```
python main.py
```

- Enter a known service name (e.g., `Spotify`) or paste a product/service description. Press Enter on an empty line to finish input.
- The app will generate and display a markdown report.
- You can choose to save the report to a file.

## Example
```
Enter a known service name (e.g., 'Spotify') or paste a product/service description. Press Enter when done:
Spotify

[INFO] Generating report...

# Spotify
... (markdown report) ...
```

## Security
- Your OpenAI API key is loaded from the `.env` file and **must not** be committed to version control.
- `.env` is included in `.gitignore` by default.

## License
MIT 