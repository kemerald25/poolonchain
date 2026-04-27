-- Trigger function to update user cp_total
CREATE OR REPLACE FUNCTION update_user_cp_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET cp_total = (
        SELECT COALESCE(SUM(amount), 0)
        FROM cp_transactions
        WHERE user_id = NEW.user_id
    )
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_cp_transaction_insert
AFTER INSERT ON cp_transactions
FOR EACH ROW
EXECUTE FUNCTION update_user_cp_total();
