CREATE TYPE role AS ENUM ('manager','contractor','vendor');
CREATE TYPE project_status AS ENUM ('Published','Bidding','Closed','Awarded','Completed');
CREATE TYPE bid_status AS ENUM ('New','Reviewed','Accepted','Rejected');
CREATE TYPE procurement_status AS ENUM ('open','quoted','awarded');
CREATE TYPE transaction_type AS ENUM ('received','requested','withdrawn','refunded');
CREATE TYPE storage_category AS ENUM ('bidding_documents','technical_proposals','financial_proposals','procurement_specifications','vendor_quotations','contracts','progress_photos','proof_of_delivery');

CREATE TABLE users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role role NOT NULL,
  company TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE contractors (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vendors (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  budget NUMERIC(19,4),
  status project_status NOT NULL,
  bids_count INT NOT NULL DEFAULT 0,
  estimated_cost NUMERIC(19,4),
  contingency NUMERIC(19,4),
  contingency_percent NUMERIC(5,2),
  payment_schedule TEXT,
  payment_terms TEXT,
  retention_percent NUMERIC(5,2),
  category TEXT,
  description TEXT,
  client_name TEXT,
  client_company TEXT,
  bid_days INT,
  max_bids INT,
  contractor_id UUID REFERENCES contractors(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bids (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  contractor_id UUID REFERENCES contractors(id) ON DELETE SET NULL,
  bidder_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  amount NUMERIC(19,4) NOT NULL,
  duration INT NOT NULL,
  message TEXT,
  status bid_status NOT NULL DEFAULT 'New',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX bids_project_idx ON bids(project_id);

CREATE TABLE procurement_requests (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  contractor_id UUID REFERENCES contractors(id) ON DELETE SET NULL,
  item TEXT NOT NULL,
  specification TEXT NOT NULL,
  quantity INT NOT NULL,
  unit TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  requested_date TIMESTAMPTZ NOT NULL,
  status procurement_status NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX procurement_project_idx ON procurement_requests(project_id);

CREATE TABLE escrow_wallet_transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  amount NUMERIC(19,4) NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  description TEXT,
  payment_request_id UUID
);
CREATE INDEX ewt_user_idx ON escrow_wallet_transactions(user_id);
CREATE INDEX ewt_project_idx ON escrow_wallet_transactions(project_id);

CREATE TABLE file_storage_records (
  id UUID PRIMARY KEY,
  category storage_category NOT NULL,
  url TEXT NOT NULL,
  path TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size INT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  bid_id UUID REFERENCES bids(id) ON DELETE CASCADE,
  procurement_id UUID REFERENCES procurement_requests(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX fsr_project_idx ON file_storage_records(project_id);
CREATE INDEX fsr_bid_idx ON file_storage_records(bid_id);
CREATE INDEX fsr_procurement_idx ON file_storage_records(procurement_id);

