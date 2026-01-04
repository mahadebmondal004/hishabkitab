CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  mobile VARCHAR(15),
  pin_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  name VARCHAR(100) NOT NULL,
  mobile VARCHAR(15),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  entry_type ENUM('CREDIT', 'DEBIT') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  note TEXT,
  entry_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Optional optimization table, though for MVP we might calculate on fly // I will add it as user requested
CREATE TABLE IF NOT EXISTS balances (
  customer_id INT PRIMARY KEY,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Products / Stock Management
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('PRODUCT', 'SERVICE') NOT NULL DEFAULT 'PRODUCT',
  name VARCHAR(255) NOT NULL,
  rate DECIMAL(10,2) NOT NULL DEFAULT 0, -- Sale Price
  purchase_rate DECIMAL(10,2) DEFAULT 0,
  unit VARCHAR(50) DEFAULT 'pc',
  stock INT DEFAULT 0,
  low_stock_alert INT DEFAULT 0,
  tax_included BOOLEAN DEFAULT FALSE,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  hsn_sac VARCHAR(50),
  img_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Invoices / Bills (Sale & Purchase)
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  customer_id INT, -- Optional: link to existing customer
  customer_name VARCHAR(255), -- For walking customers
  invoice_number VARCHAR(50),
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  type ENUM('SALE', 'PURCHASE') DEFAULT 'SALE',
  invoice_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Invoice Items
CREATE TABLE IF NOT EXISTS invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  product_id INT, -- Optional: link to product if tracked
  product_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Staff Management
CREATE TABLE IF NOT EXISTS staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  mobile VARCHAR(15),
  pin_hash VARCHAR(255), -- For staff login
  role ENUM('STAFF', 'MANAGER') DEFAULT 'STAFF',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
