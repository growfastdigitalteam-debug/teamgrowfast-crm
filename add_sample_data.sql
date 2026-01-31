-- Add Sample Leads to See Beautiful Dashboard
-- Run this in Supabase SQL Editor

-- First, get your tenant_id
-- SELECT tenant_id FROM users WHERE email = 'your-company-email@example.com';
-- Replace 'YOUR_TENANT_ID_HERE' below with the actual UUID

-- Sample Leads with variety of statuses and sources
INSERT INTO leads (tenant_id, name, phone, alternate_phone, source, category, status, notes, custom_fields, created_by)
VALUES 
-- Hot Leads
('YOUR_TENANT_ID_HERE', 'Rajesh Kumar', '9876543210', '9876543210', 'Facebook', 'Hot Lead', 'Interested', 'Very interested in 3BHK', 
 '{"location": "Mumbai", "flatConfig": "3 BHK", "remarksHistory": []}', 
 (SELECT id FROM auth.users WHERE email = 'your-email@example.com')),

('YOUR_TENANT_ID_HERE', 'Priya Sharma', '9876543211', '9876543211', 'Google', 'Hot Lead', 'Site Visit Scheduled', 'Site visit on Monday', 
 '{"location": "Pune", "flatConfig": "2 BHK", "remarksHistory": []}', 
 (SELECT id FROM auth.users WHERE email = 'your-email@example.com')),

-- Warm Leads
('YOUR_TENANT_ID_HERE', 'Amit Patel', '9876543212', '9876543212', 'Referral', 'Warm Lead', 'Follow Up', 'Call back next week', 
 '{"location": "Delhi", "flatConfig": "4 BHK", "remarksHistory": []}', 
 (SELECT id FROM auth.users WHERE email = 'your-email@example.com')),

('YOUR_TENANT_ID_HERE', 'Sneha Reddy', '9876543213', '9876543213', 'Website', 'Warm Lead', 'Interested', 'Budget discussion pending', 
 '{"location": "Bangalore", "flatConfig": "2 BHK", "remarksHistory": []}', 
 (SELECT id FROM auth.users WHERE email = 'your-email@example.com')),

-- Cold Leads  
('YOUR_TENANT_ID_HERE', 'Vikram Singh', '9876543214', '9876543214', 'Direct', 'Cold Lead', 'Not Responding', 'No response to calls', 
 '{"location": "Hyderabad", "flatConfig": "3 BHK", "remarksHistory": []}', 
 (SELECT id FROM auth.users WHERE email = 'your-email@example.com')),

-- Converted/Booked
('YOUR_TENANT_ID_HERE', 'Anjali Mehta', '9876543215', '9876543215', 'Facebook', 'Converted', 'Booked', 'Booked 3BHK Premium', 
 '{"location": "Mumbai", "flatConfig": "3 BHK", "remarksHistory": []}', 
 (SELECT id FROM auth.users WHERE email = 'your-email@example.com')),

('YOUR_TENANT_ID_HERE', 'Rahul Verma', '9876543216', '9876543216', 'Google', 'Converted', 'Booked', 'Booked 2BHK Tower A', 
 '{"location": "Pune", "flatConfig": "2 BHK", "remarksHistory": []}', 
 (SELECT id FROM auth.users WHERE email = 'your-email@example.com')),

-- More variety
('YOUR_TENANT_ID_HERE', 'Deepak Joshi', '9876543217', '9876543217', 'WhatsApp', 'Hot Lead', 'Site Visit Completed', 'Liked the property', 
 '{"location": "Noida", "flatConfig": "3 BHK", "remarksHistory": []}', 
 (SELECT id FROM auth.users WHERE email = 'your-email@example.com')),

('YOUR_TENANT_ID_HERE', 'Kavita Desai', '9876543218', '9876543218', 'Instagram', 'Warm Lead', 'Call Back', 'Will decide by month end', 
 '{"location": "Chennai", "flatConfig": "2 BHK", "remarksHistory": []}', 
 (SELECT id FROM auth.users WHERE email = 'your-email@example.com')),

('YOUR_TENANT_ID_HERE', 'Suresh Nair', '9876543219', '9876543219', 'Cold Calling', 'Cold Lead', 'Junk Lead', 'Wrong number', 
 '{"location": "Kochi", "flatConfig": "1 BHK", "remarksHistory": []}', 
 (SELECT id FROM auth.users WHERE email = 'your-email@example.com'));

-- Verify the data
SELECT COUNT(*) as total_leads FROM leads WHERE tenant_id = 'YOUR_TENANT_ID_HERE';
