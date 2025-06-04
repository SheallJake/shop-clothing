-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS update_product_rating_trigger ON "Review";
DROP FUNCTION IF EXISTS update_product_rating();

-- Create or replace the function
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the product's average rating and review count
    UPDATE "Product"
    SET 
        "averageRating" = (
            SELECT COALESCE(AVG(rating), 0)
            FROM "Review"
            WHERE "productId" = COALESCE(NEW."productId", OLD."productId")
        ),
        "reviewCount" = (
            SELECT COUNT(*)
            FROM "Review"
            WHERE "productId" = COALESCE(NEW."productId", OLD."productId")
        )
    WHERE id = COALESCE(NEW."productId", OLD."productId");
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER update_product_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON "Review"
FOR EACH ROW
EXECUTE FUNCTION update_product_rating(); 