-- Pravah Logistics Schema: Fictional Demonstration Seed Data
-- All data is synthetic and educational. No real military/operational data.

-- 1. ROLES
INSERT INTO public.roles (name, description) VALUES
    ('System Administrator', 'Full system management and configuration privileges.'),
    ('Senior Logistics Officer', 'Reviews logistics readiness, approves supply allocations and shipments.'),
    ('Inventory Officer', 'Manages depot stock levels, receives goods, and oversees issues and transfers.'),
    ('Transportation Officer', 'Schedules and oversees convoy movement and inter-depot shipments.'),
    ('Forecasting Analyst', 'Monitors demand models, stock projections, and consumption variability.'),
    ('Read-only Auditor', 'Reviews audit logs, transaction histories, and compliance records without write access.')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- 2. SUPPLY LOCATIONS (Fictional)
INSERT INTO public.locations (code, name, location_type, region, description, is_active) VALUES
    ('loc-north', 'North Ridge Depot', 'Depot', 'Northern Sector (Demo)', 'Primary forward storage and staging point in northern zone.', true),
    ('loc-valley', 'Valley Support Hub', 'Hub', 'Valley Sector (Demo)', 'Central distribution facility servicing surrounding detachments.', true),
    ('loc-east', 'East Field Store', 'Field Store', 'Eastern Sector (Demo)', 'Secondary advance supply store supporting border outposts.', true),
    ('loc-west', 'Western Forward Base', 'Forward Base', 'Western Sector (Demo)', 'Forward operational outpost with austere holding facilities.', true),
    ('loc-central', 'Central Reserve Hub', 'Main Warehouse', 'Central Command (Demo)', 'Strategic reserve holding repository and replenishment terminal.', true)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    location_type = EXCLUDED.location_type,
    region = EXCLUDED.region,
    description = EXCLUDED.description;

-- 3. INVENTORY ITEMS (Fictional)
INSERT INTO public.inventory_items (sku, name, category, unit, reorder_threshold, daily_usage, is_active) VALUES
    ('food-001', 'Food packs', 'Food', 'packs', 300, 100, true),
    ('fuel-001', 'Fuel', 'Fuel', 'litres', 500, 200, true),
    ('med-001', 'Medical kits', 'Medical', 'kits', 30, 5, true),
    ('parts-001', 'Vehicle spare parts', 'Maintenance', 'units', 25, 4, true),
    ('water-001', 'Water containers', 'Water', 'containers', 100, 40, true),
    ('comm-001', 'Field Comms Sets', 'Communications', 'sets', 15, 2, true)
ON CONFLICT (sku) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    unit = EXCLUDED.unit,
    reorder_threshold = EXCLUDED.reorder_threshold,
    daily_usage = EXCLUDED.daily_usage;

-- 4. INVENTORY BALANCES
-- Using subqueries to resolve UUIDs reliably
DO $$
DECLARE
    r_loc RECORD;
    r_item RECORD;
BEGIN
    -- loc-north
    SELECT id INTO r_loc FROM public.locations WHERE code = 'loc-north';
    IF FOUND THEN
        SELECT id INTO r_item FROM public.inventory_items WHERE sku = 'food-001';
        INSERT INTO public.inventory_balances (location_id, item_id, quantity) VALUES (r_loc.id, r_item.id, 700)
        ON CONFLICT (location_id, item_id) DO UPDATE SET quantity = EXCLUDED.quantity;

        SELECT id INTO r_item FROM public.inventory_items WHERE sku = 'fuel-001';
        INSERT INTO public.inventory_balances (location_id, item_id, quantity) VALUES (r_loc.id, r_item.id, 1200)
        ON CONFLICT (location_id, item_id) DO UPDATE SET quantity = EXCLUDED.quantity;

        SELECT id INTO r_item FROM public.inventory_items WHERE sku = 'med-001';
        INSERT INTO public.inventory_balances (location_id, item_id, quantity) VALUES (r_loc.id, r_item.id, 25) -- Below reorder 30
        ON CONFLICT (location_id, item_id) DO UPDATE SET quantity = EXCLUDED.quantity;

        SELECT id INTO r_item FROM public.inventory_items WHERE sku = 'parts-001';
        INSERT INTO public.inventory_balances (location_id, item_id, quantity) VALUES (r_loc.id, r_item.id, 40)
        ON CONFLICT (location_id, item_id) DO UPDATE SET quantity = EXCLUDED.quantity;

        SELECT id INTO r_item FROM public.inventory_items WHERE sku = 'water-001';
        INSERT INTO public.inventory_balances (location_id, item_id, quantity) VALUES (r_loc.id, r_item.id, 260)
        ON CONFLICT (location_id, item_id) DO UPDATE SET quantity = EXCLUDED.quantity;

        SELECT id INTO r_item FROM public.inventory_items WHERE sku = 'comm-001';
        INSERT INTO public.inventory_balances (location_id, item_id, quantity) VALUES (r_loc.id, r_item.id, 35)
        ON CONFLICT (location_id, item_id) DO UPDATE SET quantity = EXCLUDED.quantity;
    END IF;

    -- loc-valley
    SELECT id INTO r_loc FROM public.locations WHERE code = 'loc-valley';
    IF FOUND THEN
        SELECT id INTO r_item FROM public.inventory_items WHERE sku = 'food-001';
        INSERT INTO public.inventory_balances (location_id, item_id, quantity) VALUES (r_loc.id, r_item.id, 450)
        ON CONFLICT (location_id, item_id) DO UPDATE SET quantity = EXCLUDED.quantity;

        SELECT id INTO r_item FROM public.inventory_items WHERE sku = 'fuel-001';
        INSERT INTO public.inventory_balances (location_id, item_id, quantity) VALUES (r_loc.id, r_item.id, 950)
        ON CONFLICT (location_id, item_id) DO UPDATE SET quantity = EXCLUDED.quantity;

        SELECT id INTO r_item FROM public.inventory_items WHERE sku = 'med-001';
        INSERT INTO public.inventory_balances (location_id, item_id, quantity) VALUES (r_loc.id, r_item.id, 80)
        ON CONFLICT (location_id, item_id) DO UPDATE SET quantity = EXCLUDED.quantity;

        SELECT id INTO r_item FROM public.inventory_items WHERE sku = 'parts-001';
        INSERT INTO public.inventory_balances (location_id, item_id, quantity) VALUES (r_loc.id, r_item.id, 55)
        ON CONFLICT (location_id, item_id) DO UPDATE SET quantity = EXCLUDED.quantity;

        SELECT id INTO r_item FROM public.inventory_items WHERE sku = 'water-001';
        INSERT INTO public.inventory_balances (location_id, item_id, quantity) VALUES (r_loc.id, r_item.id, 240)
        ON CONFLICT (location_id, item_id) DO UPDATE SET quantity = EXCLUDED.quantity;
    END IF;

    -- loc-east
    SELECT id INTO r_loc FROM public.locations WHERE code = 'loc-east';
    IF FOUND THEN
        SELECT id INTO r_item FROM public.inventory_items WHERE sku = 'food-001';
        INSERT INTO public.inventory_balances (location_id, item_id, quantity) VALUES (r_loc.id, r_item.id, 180) -- Critical! daily 100
        ON CONFLICT (location_id, item_id) DO UPDATE SET quantity = EXCLUDED.quantity;

        SELECT id INTO r_item FROM public.inventory_items WHERE sku = 'fuel-001';
        INSERT INTO public.inventory_balances (location_id, item_id, quantity) VALUES (r_loc.id, r_item.id, 380) -- Below reorder 500
        ON CONFLICT (location_id, item_id) DO UPDATE SET quantity = EXCLUDED.quantity;

        SELECT id INTO r_item FROM public.inventory_items WHERE sku = 'med-001';
        INSERT INTO public.inventory_balances (location_id, item_id, quantity) VALUES (r_loc.id, r_item.id, 8) -- Critical! daily 5 * 2 = 10
        ON CONFLICT (location_id, item_id) DO UPDATE SET quantity = EXCLUDED.quantity;

        SELECT id INTO r_item FROM public.inventory_items WHERE sku = 'parts-001';
        INSERT INTO public.inventory_balances (location_id, item_id, quantity) VALUES (r_loc.id, r_item.id, 45)
        ON CONFLICT (location_id, item_id) DO UPDATE SET quantity = EXCLUDED.quantity;

        SELECT id INTO r_item FROM public.inventory_items WHERE sku = 'water-001';
        INSERT INTO public.inventory_balances (location_id, item_id, quantity) VALUES (r_loc.id, r_item.id, 85) -- Below reorder 100
        ON CONFLICT (location_id, item_id) DO UPDATE SET quantity = EXCLUDED.quantity;
    END IF;
END $$;

-- 5. INITIAL ALERTS
DO $$
DECLARE
    v_loc_east UUID;
    v_item_med UUID;
    v_item_food UUID;
    v_item_fuel UUID;
BEGIN
    SELECT id INTO v_loc_east FROM public.locations WHERE code = 'loc-east';
    SELECT id INTO v_item_med FROM public.inventory_items WHERE sku = 'med-001';
    SELECT id INTO v_item_food FROM public.inventory_items WHERE sku = 'food-001';
    SELECT id INTO v_item_fuel FROM public.inventory_items WHERE sku = 'fuel-001';

    IF v_loc_east IS NOT NULL AND v_item_med IS NOT NULL THEN
        INSERT INTO public.alerts (alert_type, severity, title, description, item_id, location_id, status)
        VALUES ('stock_critical', 'critical', 'Medical kits stock is critical at East Field Store', 'Available stock (8 kits) is under 2 days of daily usage (1.6 days remaining).', v_item_med, v_loc_east, 'open');
    END IF;

    IF v_loc_east IS NOT NULL AND v_item_food IS NOT NULL THEN
        INSERT INTO public.alerts (alert_type, severity, title, description, item_id, location_id, status)
        VALUES ('stock_critical', 'critical', 'Food packs stock is critical at East Field Store', 'Available stock (180 packs) is under 2 days of daily consumption (1.8 days remaining).', v_item_food, v_loc_east, 'open');
    END IF;

    IF v_loc_east IS NOT NULL AND v_item_fuel IS NOT NULL THEN
        INSERT INTO public.alerts (alert_type, severity, title, description, item_id, location_id, status)
        VALUES ('stock_low', 'warning', 'Fuel below reorder threshold at East Field Store', 'Available stock (380 litres) is below 500L threshold. Resupply recommended.', v_item_fuel, v_loc_east, 'open');
    END IF;
END $$;

-- 6. DEMO SHIPMENTS (Transportation Prototype)
DO $$
DECLARE
    v_loc_valley UUID;
    v_loc_east UUID;
    v_loc_north UUID;
BEGIN
    SELECT id INTO v_loc_valley FROM public.locations WHERE code = 'loc-valley';
    SELECT id INTO v_loc_east FROM public.locations WHERE code = 'loc-east';
    SELECT id INTO v_loc_north FROM public.locations WHERE code = 'loc-north';

    IF v_loc_valley IS NOT NULL AND v_loc_east IS NOT NULL THEN
        INSERT INTO public.shipments (reference_no, origin_location_id, destination_location_id, status, cargo_summary, planned_dispatch, estimated_arrival)
        VALUES
        ('SHP-2026-001', v_loc_valley, v_loc_east, 'in_transit', 'Emergency Resupply: 50 Medical Kits & 300 Food Packs', now() - interval '2 hours', now() + interval '4 hours')
        ON CONFLICT (reference_no) DO NOTHING;
    END IF;

    IF v_loc_north IS NOT NULL AND v_loc_east IS NOT NULL THEN
        INSERT INTO public.shipments (reference_no, origin_location_id, destination_location_id, status, cargo_summary, planned_dispatch, estimated_arrival)
        VALUES
        ('SHP-2026-002', v_loc_north, v_loc_east, 'planned', 'Routine Replenishment: 400L Fuel & 100 Water Containers', now() + interval '8 hours', now() + interval '18 hours')
        ON CONFLICT (reference_no) DO NOTHING;
    END IF;
END $$;

-- 7. INITIAL AUDIT LOG
INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
VALUES ('system', 'SYSTEM_INITIALIZATION', 'database', 'pravah-schema', '{"message": "Pravah initial schema and fictional demo dataset applied.", "version": "0.1.0"}'::jsonb);
