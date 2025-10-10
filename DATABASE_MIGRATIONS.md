# Database Migrations

## Paycycle Settings Columns

To enable paycycle settings toggles in the Paycycle Setup page, add the following columns to your `companies` table:

### SQL Migration Script

```sql
-- Add paycycle settings columns to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS allow_defaults BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_group_entry BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS time_clock_imports BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS use_all_departments BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_notification BOOLEAN DEFAULT false;

-- Optional: Add comments to document the columns
COMMENT ON COLUMN companies.allow_defaults IS 'Allow default values for paycycle entries';
COMMENT ON COLUMN companies.auto_group_entry IS 'Automatically group time entries';
COMMENT ON COLUMN companies.time_clock_imports IS 'Enable time clock imports';
COMMENT ON COLUMN companies.use_all_departments IS 'Use all departments for paycycle';
COMMENT ON COLUMN companies.email_notification IS 'Send email notifications for paycycle events';
```

### How to Apply in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the SQL migration script above
5. Click **Run** to execute the migration

### Column Descriptions

| Column                | Type    | Default | Description                                                              |
| --------------------- | ------- | ------- | ------------------------------------------------------------------------ |
| `allow_defaults`      | BOOLEAN | false   | Allows the system to use default values when processing paycycle entries |
| `auto_group_entry`    | BOOLEAN | false   | Automatically groups related time entries together                       |
| `time_clock_imports`  | BOOLEAN | false   | Enables importing data from time clock systems                           |
| `use_all_departments` | BOOLEAN | false   | Includes all departments in paycycle processing                          |
| `email_notification`  | BOOLEAN | false   | Sends email notifications for paycycle events and updates                |

### Note

The UI will work without these columns (changes will persist in the browser session only), but to save settings permanently to the database, these columns must be added.
