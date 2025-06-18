from dotenv import load_dotenv
load_dotenv()

import os
import json
import openai

# Load OpenAI API key from environment variable
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("Error: Please set your OpenAI API key in the OPENAI_API_KEY environment variable or .env file.")
    exit(1)
openai.api_key = OPENAI_API_KEY

# Load products dataset
with open("products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

# Define the function schema for OpenAI function calling
function_schema = [
    {
        "name": "filter_products",
        "description": "Filter products based on user preferences.",
        "parameters": {
            "type": "object",
            "properties": {
                "preferences": {
                    "type": "string",
                    "description": "User's product preferences in natural language."
                },
                "products": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "category": {"type": "string"},
                            "price": {"type": "number"},
                            "rating": {"type": "number"},
                            "in_stock": {"type": "boolean"}
                        },
                        "required": ["name", "category", "price", "rating", "in_stock"]
                    },
                    "description": "List of products to filter."
                }
            },
            "required": ["preferences", "products"]
        }
    }
]

def main():
    print("Welcome to the Product Search Tool!")
    print("Enter your product search request (e.g., 'I want electronics under $100 that are in stock and have at least a 4.4 rating.'):")
    user_input = input("> ")

    # Prepare the messages for OpenAI
    messages = [
        {"role": "system", "content": "You are a helpful assistant that filters products based on user preferences. Use the function call to return only the filtered products in a structured list."},
        {"role": "user", "content": user_input}
    ]

    # Call OpenAI with function calling (compatible with openai v0.28)
    response = openai.ChatCompletion.create(
        model="gpt-4.1-mini",
        messages=messages,
        functions=function_schema,
        function_call={
            "name": "filter_products",
            "arguments": json.dumps({
                "preferences": user_input,
                "products": products
            })
        },
        temperature=0,
        max_tokens=512
    )

    # Extract the function call result
    try:
        function_args = response["choices"][0]["message"]["function_call"]["arguments"]
        filtered = json.loads(function_args)
        filtered_products = filtered.get("filtered_products") or filtered.get("products") or []
    except Exception as e:
        print("Error parsing OpenAI response:", e)
        print("Raw response:", response)
        return

    # Print the filtered products
    if not filtered_products:
        print("No products found matching your criteria.")
    else:
        print("\nFiltered Products:")
        for idx, prod in enumerate(filtered_products, 1):
            print(f"{idx}. {prod['name']} - ${prod['price']}, Rating: {prod['rating']}, {'In Stock' if prod['in_stock'] else 'Out of Stock'}")

if __name__ == "__main__":
    main() 