-- Insert existing users into customers table
INSERT INTO customers (id, name, email, birthday, points) 
VALUES 
  ('ed4a5905-c7a0-4b6d-96fb-c35701c9ef4e', 'Dafin', 'dafin.fc2020@gmail.com', null, 0),
  ('82316f76-7428-442e-b8c7-43d62de317c0', 'Marius', 'marius@gmail.com', null, 0)
ON CONFLICT (id) DO NOTHING;