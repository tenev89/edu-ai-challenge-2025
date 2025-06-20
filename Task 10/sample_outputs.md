# Sample Outputs

Here are a couple of sample runs of the application with different user requests.

---

### Sample Run 1

**User Request:** "I need a smartphone under $800 with a great camera and long battery life"

**Application Output:**
```
Welcome to the Product Search Tool!
Please describe what you're looking for: I need a smartphone under $800 with a great camera and long battery life

Filtering with the following criteria:
- Max Price: 800
- Category: Electronics

Filtered Products:
1. Wireless Headphones - $99.99, Rating: 4.5, In Stock
2. Smart Watch - $199.99, Rating: 4.6, In Stock
3. Bluetooth Speaker - $49.99, Rating: 4.4, In Stock
4. 4K Monitor - $349.99, Rating: 4.7, In Stock
5. Noise-Cancelling Headphones - $299.99, Rating: 4.8, In Stock
6. Gaming Mouse - $59.99, Rating: 4.3, In Stock
7. External Hard Drive - $89.99, Rating: 4.4, In Stock
8. Portable Charger - $29.99, Rating: 4.2, In Stock
```
*(Note: The model interpreted "great camera and long battery life" as a general search within the 'Electronics' category and did not narrow it down to a specific 'smartphone' name, as the function calling is based on the available parameters.)*

---

### Sample Run 2

**User Request:** "Show me fitness items that are in stock and cost less than $50"

**Application Output:**
```
Welcome to the Product Search Tool!
Please describe what you're looking for: Show me fitness items that are in stock and cost less than $50

Filtering with the following criteria:
- In Stock: True
- Category: Fitness
- Max Price: 50

Filtered Products:
1. Yoga Mat - $19.99, Rating: 4.3, In Stock
2. Resistance Bands - $14.99, Rating: 4.1, In Stock
3. Kettlebell - $39.99, Rating: 4.3, In Stock
4. Foam Roller - $24.99, Rating: 4.5, In Stock
5. Jump Rope - $9.99, Rating: 4.0, In Stock
6. Ab Roller - $19.99, Rating: 4.2, In Stock
``` 