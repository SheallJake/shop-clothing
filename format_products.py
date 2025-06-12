import json
import re
import os

def extract_price(price_str):
    if not price_str:
        return 0.0
    return float(re.sub(r'[^\d.]', '', price_str))

def extract_discount_percent(discount_str):
    if not discount_str:
        return 0
    match = re.search(r'-(\d+)%', discount_str)
    return int(match.group(1)) if match else 0

def extract_product_info(full_name):
    # Разделяем полное название на части
    name_parts = full_name.split(',')
    
    # Базовое название (первая часть до первой запятой)
    name = name_parts[0].strip()
    
    # Ищем цвет в оставшихся частях
    color = None
    for part in name_parts[1:]:
        part = part.strip()
        # Ищем текст после слова "колір"
        color_match = re.search(r'колір\s+(.+?)(?:,|$)', part.lower())
        if color_match:
            color = color_match.group(1).strip()
            break
    
    return {
        'name': name,
        'description': full_name,  # Оставляем полное название как есть
        'color': [color] if color else []
    }

def get_category_id(category_name):
    # Map category names to their IDs
    category_map = {
        "Вітровки": 1,
        "Куртки": 2,
        "Худі": 3,
        "Кросівки": 4,
        "Спортивні штани": 5
    }
    return category_map.get(category_name, 1)  # Default to 1 if category not found

def format_products():
    try:
        # Read existing products.json
        with open('products.json', 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        formatted_products = []
        
        for product in products:
            # Create new product structure according to Prisma schema
            formatted_product = {
                "name": "",
                "description": None,
                "color": [],
                "size": product.get('size'),
                "brand": product.get('brand', 'AGER'),
                "price": product.get('price', 0.0),
                "stockQuantity": product.get('stockQuantity', 10),
                "mainImage": product.get('mainImage'),
                "galleryImages": product.get('galleryImages', []),
                "categoryId": get_category_id(product.get('categoryName')),
                "averageRating": product.get('averageRating', 0.0),
                "reviewCount": product.get('reviewCount', 0),
                "discountPrice": product.get('discountPrice'),
                "isDiscountActive": product.get('isDiscountActive', False)
            }
            
            # Process name and extract product info
            if 'name' in product:
                product_info = extract_product_info(product['name'])
                formatted_product['name'] = product_info['name']
                formatted_product['description'] = product_info['description']
                formatted_product['color'] = product_info['color']
            
            formatted_products.append(formatted_product)
        
        # Save formatted products
        with open('formatted_products.json', 'w', encoding='utf-8') as f:
            json.dump(formatted_products, f, ensure_ascii=False, indent=2)
        
        print(f"Successfully formatted {len(formatted_products)} products")
        
    except Exception as e:
        print(f"Error formatting products: {str(e)}")

if __name__ == "__main__":
    format_products() 