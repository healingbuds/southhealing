CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: drgreen_cart; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.drgreen_cart (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    strain_id text NOT NULL,
    strain_name text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: drgreen_clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.drgreen_clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    drgreen_client_id text NOT NULL,
    country_code text DEFAULT 'PT'::text NOT NULL,
    is_kyc_verified boolean DEFAULT false,
    admin_approval text DEFAULT 'PENDING'::text,
    kyc_link text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    avatar_url text,
    preferences jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: drgreen_cart drgreen_cart_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drgreen_cart
    ADD CONSTRAINT drgreen_cart_pkey PRIMARY KEY (id);


--
-- Name: drgreen_cart drgreen_cart_user_id_strain_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drgreen_cart
    ADD CONSTRAINT drgreen_cart_user_id_strain_id_key UNIQUE (user_id, strain_id);


--
-- Name: drgreen_clients drgreen_clients_drgreen_client_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drgreen_clients
    ADD CONSTRAINT drgreen_clients_drgreen_client_id_key UNIQUE (drgreen_client_id);


--
-- Name: drgreen_clients drgreen_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drgreen_clients
    ADD CONSTRAINT drgreen_clients_pkey PRIMARY KEY (id);


--
-- Name: drgreen_clients drgreen_clients_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drgreen_clients
    ADD CONSTRAINT drgreen_clients_user_id_key UNIQUE (user_id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: drgreen_cart update_drgreen_cart_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_drgreen_cart_updated_at BEFORE UPDATE ON public.drgreen_cart FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: drgreen_clients update_drgreen_clients_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_drgreen_clients_updated_at BEFORE UPDATE ON public.drgreen_clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: drgreen_cart drgreen_cart_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drgreen_cart
    ADD CONSTRAINT drgreen_cart_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: drgreen_clients drgreen_clients_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drgreen_clients
    ADD CONSTRAINT drgreen_clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: drgreen_cart Users can delete from their own cart; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete from their own cart" ON public.drgreen_cart FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: drgreen_cart Users can insert into their own cart; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert into their own cart" ON public.drgreen_cart FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: drgreen_clients Users can insert their own drgreen client; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own drgreen client" ON public.drgreen_clients FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = id));


--
-- Name: drgreen_cart Users can update their own cart; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own cart" ON public.drgreen_cart FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: drgreen_clients Users can update their own drgreen client; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own drgreen client" ON public.drgreen_clients FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = id));


--
-- Name: drgreen_cart Users can view their own cart; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own cart" ON public.drgreen_cart FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: drgreen_clients Users can view their own drgreen client; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own drgreen client" ON public.drgreen_clients FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- Name: drgreen_cart; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.drgreen_cart ENABLE ROW LEVEL SECURITY;

--
-- Name: drgreen_clients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.drgreen_clients ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


