
-- Fix calls table: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Users can manage own calls" ON public.calls;
DROP POLICY IF EXISTS "Admins can view all calls" ON public.calls;
DROP POLICY IF EXISTS "Managers can view all calls" ON public.calls;

CREATE POLICY "Users can manage own calls" ON public.calls FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all calls" ON public.calls FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Managers can view all calls" ON public.calls FOR SELECT TO authenticated USING (has_role(auth.uid(), 'manager'::app_role));

-- Fix contacts table
DROP POLICY IF EXISTS "Users can manage own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can view all contacts" ON public.contacts;
DROP POLICY IF EXISTS "Managers can view all contacts" ON public.contacts;

CREATE POLICY "Users can manage own contacts" ON public.contacts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all contacts" ON public.contacts FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Managers can view all contacts" ON public.contacts FOR SELECT TO authenticated USING (has_role(auth.uid(), 'manager'::app_role));

-- Fix accounts table
DROP POLICY IF EXISTS "Users can manage own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Admins can view all accounts" ON public.accounts;
DROP POLICY IF EXISTS "Managers can view all accounts" ON public.accounts;

CREATE POLICY "Users can manage own accounts" ON public.accounts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all accounts" ON public.accounts FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Managers can view all accounts" ON public.accounts FOR SELECT TO authenticated USING (has_role(auth.uid(), 'manager'::app_role));

-- Fix deals table
DROP POLICY IF EXISTS "Users can manage own deals" ON public.deals;
DROP POLICY IF EXISTS "Admins can view all deals" ON public.deals;
DROP POLICY IF EXISTS "Managers can view all deals" ON public.deals;

CREATE POLICY "Users can manage own deals" ON public.deals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all deals" ON public.deals FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Managers can view all deals" ON public.deals FOR SELECT TO authenticated USING (has_role(auth.uid(), 'manager'::app_role));

-- Fix notes table
DROP POLICY IF EXISTS "Users can manage own notes" ON public.notes;
DROP POLICY IF EXISTS "Admins can view all notes" ON public.notes;

CREATE POLICY "Users can manage own notes" ON public.notes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all notes" ON public.notes FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Fix leads table
DROP POLICY IF EXISTS "Users can manage own leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Managers can view all leads" ON public.leads;

CREATE POLICY "Users can manage own leads" ON public.leads FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all leads" ON public.leads FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Managers can view all leads" ON public.leads FOR SELECT TO authenticated USING (has_role(auth.uid(), 'manager'::app_role));

-- Fix tasks table
DROP POLICY IF EXISTS "Users can manage own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins can view all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Managers can view all tasks" ON public.tasks;

CREATE POLICY "Users can manage own tasks" ON public.tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all tasks" ON public.tasks FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Managers can view all tasks" ON public.tasks FOR SELECT TO authenticated USING (has_role(auth.uid(), 'manager'::app_role));

-- Fix meetings table
DROP POLICY IF EXISTS "Users can manage own meetings" ON public.meetings;
DROP POLICY IF EXISTS "Admins can view all meetings" ON public.meetings;
DROP POLICY IF EXISTS "Managers can view all meetings" ON public.meetings;

CREATE POLICY "Users can manage own meetings" ON public.meetings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all meetings" ON public.meetings FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Managers can view all meetings" ON public.meetings FOR SELECT TO authenticated USING (has_role(auth.uid(), 'manager'::app_role));

-- Fix emails table
DROP POLICY IF EXISTS "Users can manage own emails" ON public.emails;
DROP POLICY IF EXISTS "Admins can view all emails" ON public.emails;

CREATE POLICY "Users can manage own emails" ON public.emails FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all emails" ON public.emails FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Fix user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Super admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Fix remaining tables
DROP POLICY IF EXISTS "Users can manage own workflow rules" ON public.workflow_rules;
DROP POLICY IF EXISTS "Admins can view all workflow rules" ON public.workflow_rules;

CREATE POLICY "Users can manage own workflow rules" ON public.workflow_rules FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all workflow rules" ON public.workflow_rules FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Fix audit_trail
DROP POLICY IF EXISTS "Users can insert own audit" ON public.audit_trail;
DROP POLICY IF EXISTS "Admins can view audit trail" ON public.audit_trail;

CREATE POLICY "Users can insert own audit" ON public.audit_trail FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view audit trail" ON public.audit_trail FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Fix profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Fix remaining tables
DROP POLICY IF EXISTS "Users can manage own email config" ON public.email_config;
CREATE POLICY "Users can manage own email config" ON public.email_config FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own cadences" ON public.cadences;
DROP POLICY IF EXISTS "Admins can view all cadences" ON public.cadences;
CREATE POLICY "Users can manage own cadences" ON public.cadences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all cadences" ON public.cadences FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Users can manage cadence steps" ON public.cadence_steps;
CREATE POLICY "Users can manage cadence steps" ON public.cadence_steps FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM cadences WHERE cadences.id = cadence_steps.cadence_id AND cadences.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM cadences WHERE cadences.id = cadence_steps.cadence_id AND cadences.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage own products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
CREATE POLICY "Users can manage own products" ON public.products FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all products" ON public.products FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Users can manage own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Admins can view all quotes" ON public.quotes;
DROP POLICY IF EXISTS "Managers can view all quotes" ON public.quotes;
CREATE POLICY "Users can manage own quotes" ON public.quotes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all quotes" ON public.quotes FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Managers can view all quotes" ON public.quotes FOR SELECT TO authenticated USING (has_role(auth.uid(), 'manager'::app_role));

DROP POLICY IF EXISTS "Users can manage quote items" ON public.quote_items;
CREATE POLICY "Users can manage quote items" ON public.quote_items FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM quotes WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM quotes WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage own social messages" ON public.social_messages;
DROP POLICY IF EXISTS "Admins can view all social messages" ON public.social_messages;
CREATE POLICY "Users can manage own social messages" ON public.social_messages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all social messages" ON public.social_messages FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Users can manage own territories" ON public.territories;
DROP POLICY IF EXISTS "Admins can view all territories" ON public.territories;
DROP POLICY IF EXISTS "Managers can view all territories" ON public.territories;
CREATE POLICY "Users can manage own territories" ON public.territories FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all territories" ON public.territories FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Managers can view all territories" ON public.territories FOR SELECT TO authenticated USING (has_role(auth.uid(), 'manager'::app_role));

DROP POLICY IF EXISTS "Users can manage own forecasts" ON public.forecasts;
DROP POLICY IF EXISTS "Admins can view all forecasts" ON public.forecasts;
DROP POLICY IF EXISTS "Managers can view all forecasts" ON public.forecasts;
CREATE POLICY "Users can manage own forecasts" ON public.forecasts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all forecasts" ON public.forecasts FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Managers can view all forecasts" ON public.forecasts FOR SELECT TO authenticated USING (has_role(auth.uid(), 'manager'::app_role));

DROP POLICY IF EXISTS "Users can manage own journeys" ON public.journeys;
DROP POLICY IF EXISTS "Admins can view all journeys" ON public.journeys;
CREATE POLICY "Users can manage own journeys" ON public.journeys FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all journeys" ON public.journeys FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
