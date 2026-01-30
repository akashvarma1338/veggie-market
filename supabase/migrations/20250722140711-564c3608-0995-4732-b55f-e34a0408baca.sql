-- Create farmers table for managing farmer information
CREATE TABLE public.farmers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  location TEXT,
  specialization TEXT, -- e.g., "Alphonso Mangoes", "Kesar Mangoes"
  experience_years INTEGER,
  avatar_url TEXT,
  bio TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;

-- Create policies - only admins can manage farmers
CREATE POLICY "Admins can view all farmers" 
ON public.farmers 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert farmers" 
ON public.farmers 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update farmers" 
ON public.farmers 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete farmers" 
ON public.farmers 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_farmers_updated_at
BEFORE UPDATE ON public.farmers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample farmer data
INSERT INTO public.farmers (name, email, phone, location, specialization, experience_years, bio, avatar_url) VALUES
('Raj Patel', 'raj.patel@email.com', '+91-9876543210', 'Ratnagiri, Maharashtra', 'Alphonso Mangoes', 15, 'Experienced Alphonso mango farmer with passion for quality produce.', '/src/assets/farmer-raj.jpg'),
('Priya Sharma', 'priya.sharma@email.com', '+91-9876543211', 'Junagadh, Gujarat', 'Kesar Mangoes', 12, 'Third-generation farmer specializing in premium Kesar varieties.', null),
('Mohan Kumar', 'mohan.kumar@email.com', '+91-9876543212', 'Salem, Tamil Nadu', 'Haden Mangoes', 8, 'Young farmer bringing modern techniques to traditional mango cultivation.', null);