import os
import json
from openai import OpenAI
from dotenv import load_dotenv

# Get the absolute path to the directory where this script is located
script_dir = os.path.dirname(os.path.abspath(__file__))

# Construct the path to the .env file and load it
dotenv_path = os.path.join(script_dir, '.env')
load_dotenv(dotenv_path=dotenv_path)

# Initialize OpenAI client
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Construct the path to products.json relative to the script directory
products_json_path = os.path.join(script_dir, 'products.json')

# Load products from JSON file
with open(products_json_path, 'r') as f:
    products_data = json.load(f)

def find_products(category=None, max_price=None, min_rating=None, in_stock=None):
    """
    Filters the product list based on the provided criteria.
    """
    filtered_products = products_data

    if category:
        filtered_products = [p for p in filtered_products if p['category'].lower() == category.lower()]
    if max_price is not None:
        filtered_products = [p for p in filtered_products if p['price'] <= max_price]
    if min_rating is not None:
        filtered_products = [p for p in filtered_products if p['rating'] >= min_rating]
    if in_stock is not None:
        filtered_products = [p for p in filtered_products if p['in_stock'] == in_stock]
    
    return json.dumps(filtered_products)

def main():
    """
    Main function to run the product search tool.
    """
    print("Welcome to the Product Search Tool!")
    user_query = input("Please describe what you're looking for: ")

    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": user_query}],
            tools=[
                {
                    "type": "function",
                    "function": {
                        "name": "find_products",
                        "description": "Get a list of products based on filters.",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "category": {
                                    "type": "string",
                                    "description": "The category of the product, e.g., Electronics, Fitness, Kitchen, Books, Clothing",
                                },
                                "max_price": {
                                    "type": "number",
                                    "description": "The maximum price of the product.",
                                },
                                "min_rating": {
                                    "type": "number",
                                    "description": "The minimum rating of the product.",
                                },
                                "in_stock": {
                                    "type": "boolean",
                                    "description": "Whether the product is in stock or not.",
                                },
                            },
                            "required": [],
                        },
                    },
                }
            ],
            tool_choice="auto",
        )
        
        response_message = response.choices[0].message
        tool_calls = response_message.tool_calls

        if tool_calls:
            for tool_call in tool_calls:
                function_name = tool_call.function.name
                if function_name == 'find_products':
                    function_args = json.loads(tool_call.function.arguments)
                    
                    print("\nFiltering with the following criteria:")
                    for key, value in function_args.items():
                        print(f"- {key.replace('_', ' ').title()}: {value}")
                    
                    filtered_results = find_products(**function_args)
                    products = json.loads(filtered_results)
                    
                    print("\nFiltered Products:")
                    if products:
                        for i, product in enumerate(products, 1):
                            stock_status = "In Stock" if product['in_stock'] else "Out of Stock"
                            print(f"{i}. {product['name']} - ${product['price']:.2f}, Rating: {product['rating']}, {stock_status}")
                    else:
                        print("No products found matching your criteria.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main() 