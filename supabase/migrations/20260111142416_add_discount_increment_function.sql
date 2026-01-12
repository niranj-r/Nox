/*
  # Add discount code usage increment function

  1. Functions
    - `increment_discount_usage`: Safely increment the current_uses counter for a discount code

  2. Purpose
    - Atomic operation to prevent race conditions when multiple users apply the same code
*/

CREATE OR REPLACE FUNCTION increment_discount_usage(discount_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE discount_codes
  SET current_uses = current_uses + 1
  WHERE code = discount_code;
END;
$$;