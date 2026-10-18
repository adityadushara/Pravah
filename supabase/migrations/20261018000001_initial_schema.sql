-- Pravah Logistics Schema: Initial Migration
-- Fictional Demonstration & Predictive Logistics Prototype
-- Date: 2026-10-18

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. PROFILES & ROLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_roles UNIQUE (user_id, role_id)
);

-- Security Definer helper to prevent recursive RLS queries
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = p_user_id AND r.name = 'System Administrator'
    );
$$;

-- Auto create profile on auth.user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, email, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), 'User'),
        NEW.email,
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE
    SET display_name = EXCLUDED.display_name,
        email = EXCLUDED.email,
        updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 2. LOCATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    location_type TEXT NOT NULL DEFAULT 'Depot',
    region TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 3. INVENTORY ITEMS & BALANCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    reorder_threshold NUMERIC NOT NULL DEFAULT 100 CHECK (reorder_threshold >= 0),
    daily_usage NUMERIC NOT NULL DEFAULT 10 CHECK (daily_usage >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    quantity NUMERIC NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_location_item UNIQUE (location_id, item_id)
);

-- ============================================================================
-- 4. TRANSACTIONS, AUDIT & ALERTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE RESTRICT,
    location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
    to_location_id UUID REFERENCES public.locations(id) ON DELETE RESTRICT,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('receipt', 'issue', 'adjustment', 'transfer')),
    quantity NUMERIC NOT NULL CHECK (quantity > 0),
    previous_balance NUMERIC,
    resulting_balance NUMERIC,
    reason TEXT,
    reference_no TEXT,
    actor_id TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type TEXT NOT NULL DEFAULT 'stock_level',
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    acknowledged_by TEXT
);

CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_no TEXT UNIQUE NOT NULL,
    origin_location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
    destination_location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'dispatched', 'in_transit', 'delivered', 'cancelled')),
    cargo_summary TEXT,
    planned_dispatch TIMESTAMPTZ,
    estimated_arrival TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id TEXT DEFAULT 'system',
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 5. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_inventory_balances_location ON public.inventory_balances(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_balances_item ON public.inventory_balances(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item ON public.inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created ON public.inventory_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.alerts(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status);

-- ============================================================================
-- 6. ATOMIC TRANSACTION RPC FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.perform_inventory_transaction(
    p_item_id UUID,
    p_location_id UUID,
    p_transaction_type TEXT,
    p_quantity NUMERIC,
    p_to_location_id UUID DEFAULT NULL,
    p_reason TEXT DEFAULT NULL,
    p_reference_no TEXT DEFAULT NULL,
    p_actor_id TEXT DEFAULT 'system'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_balance NUMERIC := 0;
    v_new_balance NUMERIC := 0;
    v_dest_balance NUMERIC := 0;
    v_dest_new_balance NUMERIC := 0;
    v_item RECORD;
    v_location RECORD;
    v_to_location RECORD;
    v_tx_id UUID;
    v_item_name TEXT;
    v_loc_name TEXT;
    v_to_loc_name TEXT;
BEGIN
    -- Input validations
    IF p_quantity IS NULL OR p_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantity must be strictly positive';
    END IF;

    IF p_transaction_type NOT IN ('receipt', 'issue', 'adjustment', 'transfer') THEN
        RAISE EXCEPTION 'Invalid transaction type: %', p_transaction_type;
    END IF;

    IF p_transaction_type = 'adjustment' AND (p_reason IS NULL OR trim(p_reason) = '') THEN
        RAISE EXCEPTION 'A documented reason is mandatory for stock adjustments';
    END IF;

    IF p_transaction_type = 'transfer' THEN
        IF p_to_location_id IS NULL THEN
            RAISE EXCEPTION 'Destination location is required for transfers';
        END IF;
        IF p_to_location_id = p_location_id THEN
            RAISE EXCEPTION 'Source and destination locations must be distinct';
        END IF;
    END IF;

    -- Verify item exists
    SELECT * INTO v_item FROM public.inventory_items WHERE id = p_item_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inventory item % not found', p_item_id;
    END IF;
    v_item_name := v_item.name;

    -- Verify location exists
    SELECT * INTO v_location FROM public.locations WHERE id = p_location_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Source location % not found', p_location_id;
    END IF;
    v_loc_name := v_location.name;

    IF p_to_location_id IS NOT NULL THEN
        SELECT * INTO v_to_location FROM public.locations WHERE id = p_to_location_id;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Destination location % not found', p_to_location_id;
        END IF;
        v_to_loc_name := v_to_location.name;
    END IF;

    -- Lock the balance row or initialize if missing
    SELECT quantity INTO v_current_balance
    FROM public.inventory_balances
    WHERE location_id = p_location_id AND item_id = p_item_id
    FOR UPDATE;

    IF NOT FOUND THEN
        INSERT INTO public.inventory_balances (location_id, item_id, quantity)
        VALUES (p_location_id, p_item_id, 0);
        v_current_balance := 0;
    END IF;

    -- Calculate new balance
    IF p_transaction_type = 'receipt' THEN
        v_new_balance := v_current_balance + p_quantity;

    ELSIF p_transaction_type = 'issue' THEN
        IF v_current_balance < p_quantity THEN
            RAISE EXCEPTION 'Insufficient stock. Available: %, requested issue: %', v_current_balance, p_quantity;
        END IF;
        v_new_balance := v_current_balance - p_quantity;

    ELSIF p_transaction_type = 'adjustment' THEN
        -- Adjustment sets target balance to p_quantity
        v_new_balance := p_quantity;

    ELSIF p_transaction_type = 'transfer' THEN
        IF v_current_balance < p_quantity THEN
            RAISE EXCEPTION 'Insufficient stock for transfer. Available: %, transfer quantity: %', v_current_balance, p_quantity;
        END IF;
        v_new_balance := v_current_balance - p_quantity;

        -- Lock or initialize destination
        SELECT quantity INTO v_dest_balance
        FROM public.inventory_balances
        WHERE location_id = p_to_location_id AND item_id = p_item_id
        FOR UPDATE;

        IF NOT FOUND THEN
            INSERT INTO public.inventory_balances (location_id, item_id, quantity)
            VALUES (p_to_location_id, p_item_id, p_quantity)
            RETURNING quantity INTO v_dest_new_balance;
        ELSE
            v_dest_new_balance := v_dest_balance + p_quantity;
            UPDATE public.inventory_balances
            SET quantity = v_dest_new_balance, updated_at = now()
            WHERE location_id = p_to_location_id AND item_id = p_item_id;
        END IF;
    END IF;

    -- Update source balance
    UPDATE public.inventory_balances
    SET quantity = v_new_balance, updated_at = now()
    WHERE location_id = p_location_id AND item_id = p_item_id;

    -- Record transaction
    INSERT INTO public.inventory_transactions (
        item_id, location_id, to_location_id, transaction_type,
        quantity, previous_balance, resulting_balance,
        reason, reference_no, actor_id, created_at
    )
    VALUES (
        p_item_id, p_location_id, p_to_location_id, p_transaction_type,
        p_quantity, v_current_balance, v_new_balance,
        p_reason, p_reference_no, p_actor_id, now()
    )
    RETURNING id INTO v_tx_id;

    -- Audit log
    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata, created_at)
    VALUES (
        p_actor_id,
        upper(p_transaction_type),
        'inventory_balance',
        v_tx_id::text,
        jsonb_build_object(
            'item_id', p_item_id,
            'item_name', v_item_name,
            'location_id', p_location_id,
            'location_name', v_loc_name,
            'to_location_id', p_to_location_id,
            'to_location_name', v_to_loc_name,
            'quantity', p_quantity,
            'previous_balance', v_current_balance,
            'resulting_balance', v_new_balance,
            'reason', p_reason,
            'reference_no', p_reference_no
        ),
        now()
    );

    -- Stock alert generation or resolution
    IF v_new_balance <= (v_item.daily_usage * 2) THEN
        INSERT INTO public.alerts (
            alert_type, severity, title, description, item_id, location_id, status, created_at
        )
        VALUES (
            'stock_critical',
            'critical',
            v_item_name || ' stock is critical',
            'Available balance (' || v_new_balance || ' ' || v_item.unit || ') is at or below 2 days daily usage at ' || v_loc_name || '.',
            p_item_id,
            p_location_id,
            'open',
            now()
        );
    ELSIF v_new_balance <= v_item.reorder_threshold THEN
        INSERT INTO public.alerts (
            alert_type, severity, title, description, item_id, location_id, status, created_at
        )
        VALUES (
            'stock_low',
            'warning',
            v_item_name || ' below reorder threshold',
            'Available balance (' || v_new_balance || ' ' || v_item.unit || ') is at or below reorder threshold of ' || v_item.reorder_threshold || ' at ' || v_loc_name || '.',
            p_item_id,
            p_location_id,
            'open',
            now()
        );
    ELSE
        -- Auto-resolve open alerts when stock rises above threshold
        UPDATE public.alerts
        SET status = 'resolved', resolved_at = now()
        WHERE item_id = p_item_id AND location_id = p_location_id AND status = 'open';
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_tx_id,
        'item_id', p_item_id,
        'location_id', p_location_id,
        'transaction_type', p_transaction_type,
        'previous_balance', v_current_balance,
        'resulting_balance', v_new_balance,
        'dest_new_balance', v_dest_new_balance
    );
END;
$$;

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Read policies for authenticated and anon users (safe operational data reads)
CREATE POLICY "Public/Auth read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public/Auth read roles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Public/Auth read user_roles" ON public.user_roles FOR SELECT USING (true);

-- Admins only can modify roles and assignments
CREATE POLICY "Admins can manage user roles" ON public.user_roles FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Public/Auth read locations" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Admins can manage locations" ON public.locations FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Public/Auth read inventory_items" ON public.inventory_items FOR SELECT USING (true);
CREATE POLICY "Public/Auth read inventory_balances" ON public.inventory_balances FOR SELECT USING (true);

-- Transactions: read-only from client, mutations go through RPC or service role
CREATE POLICY "Public/Auth read inventory_transactions" ON public.inventory_transactions FOR SELECT USING (true);
CREATE POLICY "No direct update on inventory_transactions" ON public.inventory_transactions FOR UPDATE USING (false);
CREATE POLICY "No direct delete on inventory_transactions" ON public.inventory_transactions FOR DELETE USING (false);

CREATE POLICY "Public/Auth read alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Auth users can update alerts" ON public.alerts FOR UPDATE USING (true);

CREATE POLICY "Public/Auth read shipments" ON public.shipments FOR SELECT USING (true);
CREATE POLICY "Auth users can manage shipments" ON public.shipments FOR ALL USING (true);

-- Audit logs: strictly immutable
CREATE POLICY "Public/Auth read audit_logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "No updates on audit_logs" ON public.audit_logs FOR UPDATE USING (false);
CREATE POLICY "No deletes on audit_logs" ON public.audit_logs FOR DELETE USING (false);
