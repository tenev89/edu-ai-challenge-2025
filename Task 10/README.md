# Product Search Tool

This console-based application allows you to search for products using natural language. It leverages the OpenAI API with function calling to understand your query and filter a predefined list of products.

## Prerequisites

- Python 3.6+
- An OpenAI API key

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-folder>/Task 10
    ```

2.  **Create a `.env` file:**
    Create a file named `.env` in the `Task 10` directory and add your OpenAI API key to it:
    ```
    OPENAI_API_KEY=your_openai_api_key_here
    ```

3.  **Install dependencies:**
    Install the required Python packages using pip:
    ```bash
    pip install -r requirements.txt
    ```

## How to Run

1.  Navigate to the `Task 10` directory in your terminal.
2.  Run the application with the following command:
    ```bash
    python main.py
    ```
3.  When prompted, enter your search query in natural language. For example:
    - "I'm looking for electronics under $100"
    - "Show me books with a rating of at least 4.5"
    - "Find me kitchen items that are in stock"

The application will then display the filtered list of products that match your criteria. 