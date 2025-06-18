# Product Search Console Application

## Overview
This is a console-based product search tool that leverages OpenAI's function calling to filter products from a dataset based on user preferences provided in natural language.

## Features
- Accepts user preferences in natural language (e.g., "I need a smartphone under $800 with a great camera and long battery life").
- Uses OpenAI API function calling to extract and apply filtering logic.
- Returns a structured, clear list of matching products.
- Uses a hardcoded dataset (`products.json`).

## Requirements
- Python 3.8+
- An OpenAI API key (not stored in the repo)

## Setup
1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd edu-ai-challenge-2025
   ```
2. **Install dependencies**
   ```bash
   pip install openai
   ```
3. **Set your OpenAI API key as an environment variable**
   - On Windows (PowerShell):
     ```powershell
     $env:OPENAI_API_KEY="sk-..."
     ```
   - On Linux/macOS:
     ```bash
     export OPENAI_API_KEY="sk-..."
     ```
   **Do NOT hardcode your API key in the code or repo.**

## Usage
1. Run the application:
   ```bash
   python main.py
   ```
2. When prompted, enter your product search request in natural language.
3. The application will display a list of filtered products matching your criteria.

## Dataset
- The product dataset is stored in `products.json`.
- You can modify or extend this file as needed.

## Security
- **Never commit your OpenAI API key to the repository.**
- Always use environment variables to manage sensitive credentials.

## Example
See `sample_outputs.md` for example runs. 