
-- Enums
CREATE TYPE public.app_role AS ENUM ('user','admin');
CREATE TYPE public.zone_tier AS ENUM ('Standard','Pro','VIP','Streaming','VR');
CREATE TYPE public.package_category AS ENUM ('Hourly','Day Pass','Night Session','Tournament Slot','VR Experience');
CREATE TYPE public.booking_status AS ENUM ('Pending','Confirmed','Active','Completed','Cancelled','No-Show');
CREATE TYPE public.tournament_status AS ENUM ('Upcoming','Registration Open','In Progress','Completed');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  xp_points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_hours NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Zones
CREATE TABLE public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  tier public.zone_tier NOT NULL DEFAULT 'Standard',
  hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  specs JSONB DEFAULT '{}'::jsonb,
  image_url TEXT,
  seat_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT ON public.zones TO anon, authenticated;
GRANT ALL ON public.zones TO service_role;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Zones public read" ON public.zones FOR SELECT USING (true);
CREATE POLICY "Admins manage zones" ON public.zones FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Workstations
CREATE TABLE public.workstations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT ON public.workstations TO anon, authenticated;
GRANT ALL ON public.workstations TO service_role;
ALTER TABLE public.workstations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workstations public read" ON public.workstations FOR SELECT USING (true);
CREATE POLICY "Admins manage workstations" ON public.workstations FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Packages
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category public.package_category NOT NULL DEFAULT 'Hourly',
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT ON public.packages TO anon, authenticated;
GRANT ALL ON public.packages TO service_role;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Packages public read" ON public.packages FOR SELECT USING (true);
CREATE POLICY "Admins manage packages" ON public.packages FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workstation_id UUID NOT NULL REFERENCES public.workstations(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE RESTRICT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'Pending',
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all bookings" ON public.bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users create own bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own bookings" ON public.bookings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins update all bookings" ON public.bookings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
-- Public read of occupancy info for live seat map (limited via column-level grants if needed)
CREATE POLICY "Public read bookings basic" ON public.bookings FOR SELECT TO anon USING (true);
GRANT SELECT ON public.bookings TO anon;

-- Tournaments
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  game TEXT,
  description TEXT,
  prize_pool NUMERIC(10,2) DEFAULT 0,
  entry_fee NUMERIC(10,2) DEFAULT 0,
  max_participants INTEGER DEFAULT 16,
  current_participants INTEGER DEFAULT 0,
  start_time TIMESTAMPTZ,
  status public.tournament_status NOT NULL DEFAULT 'Upcoming',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT ON public.tournaments TO anon, authenticated;
GRANT ALL ON public.tournaments TO service_role;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tournaments public read" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Admins manage tournaments" ON public.tournaments FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Tournament registrations
CREATE TABLE public.tournament_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.tournament_registrations TO authenticated;
GRANT SELECT ON public.tournament_registrations TO anon;
GRANT ALL ON public.tournament_registrations TO service_role;
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Regs public read" ON public.tournament_registrations FOR SELECT USING (true);
CREATE POLICY "Users register self" ON public.tournament_registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users unregister self" ON public.tournament_registrations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Achievements
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  xp_reward INTEGER DEFAULT 0,
  requirement_type TEXT,
  requirement_value INTEGER
);
GRANT SELECT ON public.achievements TO anon, authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements public read" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Admins manage achievements" ON public.achievements FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
GRANT SELECT, INSERT ON public.user_achievements TO authenticated;
GRANT ALL ON public.user_achievements TO service_role;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own ach" ON public.user_achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Gallery
CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT ON public.gallery TO anon, authenticated;
GRANT ALL ON public.gallery TO service_role;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gallery public read" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Admins manage gallery" ON public.gallery FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Handle new user trigger -> profile + default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, phone_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', '')
  )
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- XP/Level trigger on booking completion
CREATE OR REPLACE FUNCTION public.handle_booking_completed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE hours_played NUMERIC;
BEGIN
  IF (TG_OP = 'UPDATE' AND NEW.status = 'Completed' AND OLD.status <> 'Completed') THEN
    hours_played := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 3600.0;
    UPDATE public.profiles
    SET xp_points = xp_points + COALESCE(NEW.xp_earned, 0),
        total_sessions = total_sessions + 1,
        total_hours = total_hours + hours_played,
        level = FLOOR((xp_points + COALESCE(NEW.xp_earned,0)) / 500.0) + 1
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_booking_completed ON public.bookings;
CREATE TRIGGER on_booking_completed
AFTER UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.handle_booking_completed();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
