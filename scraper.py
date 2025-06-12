import requests
from bs4 import BeautifulSoup
import json
import os
from urllib.parse import urljoin
import time
import re

def create_directory(path):
    if not os.path.exists(path):
        os.makedirs(path)

def download_image(url, save_path):
    try:
        response = requests.get(url)
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            return True
    except Exception as e:
        print(f"Error downloading image {url}: {str(e)}")
    return False

def extract_price(price_str):
    # Remove currency symbol and whitespace, then convert to float
    if not price_str:
        return 0.0
    return float(re.sub(r'[^\d.]', '', price_str))

def extract_discount_percent(discount_str):
    if not discount_str:
        return 0
    # Extract number from string like "-69%"
    match = re.search(r'-(\d+)%', discount_str)
    return int(match.group(1)) if match else 0

def scrape_category(url, category_name):
    products = []
    print(f"Scraping category: {category_name}")
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        
        print(f"Sending request to: {url}")
        response = requests.get(url, headers=headers)
        print(f"Response status code: {response.status_code}")
        
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        product_items = soup.find_all('div', class_='slide-new-receipts__item')
        print(f"Found {len(product_items)} product items in {category_name}")
        
        for item in product_items:
            try:
                product = {
                    "name": "",
                    "description": None,
                    "color": [],
                    "size": None,
                    "brand": "AGER",
                    "price": 0.0,
                    "stockQuantity": 10,
                    "mainImage": None,
                    "galleryImages": [],
                    "categoryName": category_name,
                    "averageRating": 0.0,
                    "reviewCount": 0,
                    "discountPrice": None,
                    "isDiscountActive": False
                }
                
                name_elem = item.find('div', class_='item-slide-new-receipts__text')
                if name_elem:
                    product['name'] = name_elem.text.strip()
                
                price_drop = item.find('div', class_='item-slide-new-receipts__price-drop')
                price_guest = item.find('div', class_='item-slide-new-receipts__price-guest')
                
                if price_guest:
                    product['price'] = extract_price(price_guest.text)
                if price_drop:
                    product['discountPrice'] = extract_price(price_drop.text)
                    product['isDiscountActive'] = True
                
                img_elem = item.find('img', class_='item-slide-new-receipts__image-01')
                if img_elem and img_elem.get('src'):
                    img_url = img_elem['src']
                    img_filename = f"{category_name.lower()}_{len(products)}.jpg"
                    img_path = os.path.join("public/img", img_filename)
                    
                    if download_image(img_url, img_path):
                        product['mainImage'] = img_filename
                        product['galleryImages'] = [img_filename]
                
                sizes = []
                size_items = item.find_all('div', class_='item-slide-new-receipts__size-item')
                for size_item in size_items:
                    size_text = size_item.find('a').text.strip()
                    sizes.append(size_text)
                if sizes:
                    product['size'] = ', '.join(sizes)
                
                color_match = re.search(r'колір\s+(\w+)', product['name'].lower())
                if color_match:
                    product['color'] = [color_match.group(1)]
                
                discount_elem = item.find('div', class_='new-item-slide-new-receipts__price-image-sale')
                if discount_elem:
                    discount_percent = extract_discount_percent(discount_elem.text.strip())
                    if discount_percent > 0:
                        product['isDiscountActive'] = True
                
                if product['name']:
                    products.append(product)
                
                time.sleep(0.5)
                
            except Exception as e:
                print(f"Error processing product in {category_name}: {str(e)}")
                continue
        
        return products
        
    except Exception as e:
        print(f"Error during scraping {category_name}: {str(e)}")
        return []

def scrape_products():
    categories = {
        "Вітровки": "https://ager.ua/uk/mans/verhnyaya-odezhda-dlya-muzhchin/muzhskie-vetrovki/",
        "Куртки": "https://ager.ua/uk/mans/verhnyaya-odezhda-dlya-muzhchin/muzhskie-kurtki/",
        "Худі": "https://ager.ua/uk/mans/muzhskie-svitera-svitshoty-dzhempery/muzhskie-hudi/",
        "Кросівки": "https://ager.ua/uk/obuv/muzhskaya-obuv/muzhskie-krossovki/",
        "Спортивні штани": "https://ager.ua/uk/mans/muzhskaya-sportivnaya-odezhda/muzhskie-sportivnye-shtany/"
    }
    
    create_directory("public/img")
    all_products = []
    
    for category_name, url in categories.items():
        category_products = scrape_category(url, category_name)
        all_products.extend(category_products)
        print(f"Scraped {len(category_products)} products from {category_name}")
        time.sleep(1)  # Delay between categories
    
    with open('products.json', 'w', encoding='utf-8') as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully scraped {len(all_products)} total products")

if __name__ == "__main__":
    scrape_products() 