-- CreateEnum
CREATE TYPE "UserRoleEnum" AS ENUM ('admin', 'dispatcher', 'account_manager', 'finance', 'sales', 'technician', 'customer_org_user');

-- CreateEnum
CREATE TYPE "EquipmentClass" AS ENUM ('cardio', 'strength', 'flooring', 'functional', 'other');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('pm', 'sr', 'disinfecting', 'install');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('scheduled', 'en_route', 'on_site', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('draft', 'sent', 'signed', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('draft', 'sent', 'partially_signed', 'signed', 'terminated');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'void');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "EquipmentCondition" AS ENUM ('excellent', 'good', 'fair', 'poor');

-- CreateEnum
CREATE TYPE "GenericStatus" AS ENUM ('active', 'archived');

-- CreateEnum
CREATE TYPE "TechType" AS ENUM ('in_house', 'third_party');

-- CreateEnum
CREATE TYPE "TechAvailabilityStatus" AS ENUM ('available', 'busy', 'offline');

-- CreateEnum
CREATE TYPE "JobPriority" AS ENUM ('normal', 'urgent');

-- CreateEnum
CREATE TYPE "SignoffStatus" AS ENUM ('pending', 'signed', 'expired');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('pm', 'disinfecting', 'combined');

-- CreateEnum
CREATE TYPE "Cadence" AS ENUM ('weekly', 'monthly', 'quarterly', 'semi_annual', 'annual');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('pending', 'approved', 'paid');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('email', 'sms');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('pending', 'delivered', 'failed');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('pending', 'synced', 'failed');

-- CreateEnum
CREATE TYPE "EsignDocumentStatus" AS ENUM ('sent', 'partially_signed', 'signed', 'expired');

-- CreateEnum
CREATE TYPE "AccountUserRole" AS ENUM ('admin', 'user');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRoleEnum" NOT NULL,
    "status" "GenericStatus" NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "role" "UserRoleEnum" NOT NULL,
    "account_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "billing_email" TEXT NOT NULL,
    "billing_phone" TEXT,
    "billing_address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "stripe_customer_id" TEXT,
    "status" "GenericStatus" NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "AccountUserRole" NOT NULL DEFAULT 'user',
    "status" "GenericStatus" NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "account_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "contact_name" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "notes" TEXT,
    "status" "GenericStatus" NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "serial_number" TEXT,
    "supplier" TEXT,
    "model" TEXT,
    "equipment_class" "EquipmentClass" NOT NULL,
    "install_date" DATE,
    "warranty_start" DATE,
    "warranty_end" DATE,
    "last_service_date" DATE,
    "condition" "EquipmentCondition" NOT NULL DEFAULT 'good',
    "repair_count" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "status" "GenericStatus" NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technicians" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "tech_type" "TechType" NOT NULL,
    "base_lat" DECIMAL(9,6),
    "base_lng" DECIMAL(9,6),
    "base_location_id" UUID,
    "region" TEXT NOT NULL,
    "availability_status" "TechAvailabilityStatus" NOT NULL DEFAULT 'available',
    "performance_score" DECIMAL(5,2),
    "status" "GenericStatus" NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "technicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technician_certifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "technician_id" UUID NOT NULL,
    "equipment_class" "EquipmentClass" NOT NULL,
    "certified_at" TIMESTAMPTZ NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "technician_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technician_regions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "technician_id" UUID NOT NULL,
    "region" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "technician_regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "technician_id" UUID,
    "job_type" "JobType" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'scheduled',
    "scheduled_at" TIMESTAMPTZ NOT NULL,
    "started_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "priority" "JobPriority" NOT NULL DEFAULT 'normal',
    "notes" TEXT,
    "customer_notes" TEXT,
    "warranty_claim" BOOLEAN NOT NULL DEFAULT false,
    "warranty_supplier" TEXT,
    "stripe_charge_id" TEXT,
    "status_changed_at" TIMESTAMPTZ,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_equipment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "job_id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_parts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "job_id" UUID NOT NULL,
    "part_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_cost_cents" BIGINT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_photos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "job_id" UUID NOT NULL,
    "equipment_id" UUID,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "uploaded_by_user_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_signoffs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "job_id" UUID NOT NULL,
    "signer_name" TEXT NOT NULL,
    "signer_email" TEXT NOT NULL,
    "docusign_envelope_id" TEXT,
    "signing_url" TEXT,
    "signed_at" TIMESTAMPTZ,
    "status" "SignoffStatus" NOT NULL DEFAULT 'pending',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "job_signoffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "created_by_user_id" UUID,
    "job_type" "JobType" NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "valid_until" DATE,
    "discount_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "tax_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "subtotal_cents" BIGINT NOT NULL DEFAULT 0,
    "total_cents" BIGINT NOT NULL DEFAULT 0,
    "docusign_envelope_id" TEXT,
    "signed_at" TIMESTAMPTZ,
    "status" "QuoteStatus" NOT NULL DEFAULT 'draft',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_line_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quote_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price_cents" BIGINT NOT NULL,
    "total_cents" BIGINT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quote_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "created_by_user_id" UUID,
    "title" TEXT NOT NULL,
    "service_type" "ServiceType" NOT NULL,
    "cadence" "Cadence" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "auto_renew" BOOLEAN NOT NULL DEFAULT false,
    "auto_pay" BOOLEAN NOT NULL DEFAULT false,
    "payment_method_id" UUID,
    "total_value_cents" BIGINT NOT NULL DEFAULT 0,
    "docusign_envelope_id" TEXT,
    "signed_at" TIMESTAMPTZ,
    "status" "ContractStatus" NOT NULL DEFAULT 'draft',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_properties" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contract_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "location_id" UUID,
    "job_id" UUID,
    "contract_id" UUID,
    "invoice_number" TEXT NOT NULL,
    "due_date" DATE NOT NULL,
    "subtotal_cents" BIGINT NOT NULL DEFAULT 0,
    "tax_cents" BIGINT NOT NULL DEFAULT 0,
    "total_cents" BIGINT NOT NULL DEFAULT 0,
    "paid_cents" BIGINT NOT NULL DEFAULT 0,
    "stripe_invoice_id" TEXT,
    "warranty_claim" BOOLEAN NOT NULL DEFAULT false,
    "warranty_supplier" TEXT,
    "warranty_amount_cents" BIGINT NOT NULL DEFAULT 0,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'draft',
    "notes" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_line_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoice_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price_cents" BIGINT NOT NULL,
    "total_cents" BIGINT NOT NULL,
    "job_equipment_id" UUID,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "stripe_payment_method_id" TEXT,
    "last4" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "exp_month" INTEGER NOT NULL,
    "exp_year" INTEGER NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "status" "GenericStatus" NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "payment_method_id" UUID,
    "amount_cents" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "stripe_payment_id" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "failure_reason" TEXT,
    "refunded_at" TIMESTAMPTZ,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tech_type_filter" "TechType",
    "job_type_filter" "JobType",
    "equipment_class_filter" "EquipmentClass",
    "technician_id_filter" UUID,
    "rate_pct" DECIMAL(5,2) NOT NULL,
    "bonus_threshold_jobs" INTEGER,
    "bonus_rate_pct" DECIMAL(5,2),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "commission_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_earnings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "technician_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "invoice_line_item_id" UUID,
    "commission_rule_id" UUID,
    "job_id" UUID,
    "base_amount_cents" BIGINT NOT NULL,
    "commission_pct" DECIMAL(5,2) NOT NULL,
    "commission_cents" BIGINT NOT NULL,
    "rule_trace" JSONB NOT NULL,
    "status" "CommissionStatus" NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMPTZ,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "commission_earnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "supplier" TEXT,
    "unit_cost_cents" BIGINT NOT NULL,
    "status" "GenericStatus" NOT NULL DEFAULT 'active',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "part_inventory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "part_id" UUID NOT NULL,
    "location_id" UUID,
    "technician_id" UUID,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reorder_threshold" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "part_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_user_id" UUID,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_inbox" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "to_email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sent_at" TIMESTAMPTZ NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_inbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "esign_envelopes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "document_type" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "signer_email" TEXT NOT NULL,
    "signer_name" TEXT NOT NULL,
    "envelope_ref" TEXT,
    "signing_url" TEXT,
    "status" "EsignDocumentStatus" NOT NULL DEFAULT 'sent',
    "signed_at" TIMESTAMPTZ,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "esign_envelopes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp_sync_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "SyncStatus" NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "erp_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_sync_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "SyncStatus" NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "template_key" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'pending',
    "payload" JSONB NOT NULL,
    "error" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "request_hash" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "idempotency_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");

-- CreateIndex
CREATE INDEX "user_roles_account_id_idx" ON "user_roles"("account_id");

-- CreateIndex
CREATE INDEX "user_roles_role_idx" ON "user_roles"("role");

-- CreateIndex
CREATE INDEX "accounts_status_idx" ON "accounts"("status");

-- CreateIndex
CREATE INDEX "accounts_stripe_customer_id_idx" ON "accounts"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "account_users_account_id_idx" ON "account_users"("account_id");

-- CreateIndex
CREATE INDEX "account_users_user_id_idx" ON "account_users"("user_id");

-- CreateIndex
CREATE INDEX "account_users_status_idx" ON "account_users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "account_users_account_id_user_id_key" ON "account_users"("account_id", "user_id");

-- CreateIndex
CREATE INDEX "locations_account_id_idx" ON "locations"("account_id");

-- CreateIndex
CREATE INDEX "locations_status_idx" ON "locations"("status");

-- CreateIndex
CREATE INDEX "equipment_account_id_idx" ON "equipment"("account_id");

-- CreateIndex
CREATE INDEX "equipment_location_id_idx" ON "equipment"("location_id");

-- CreateIndex
CREATE INDEX "equipment_status_idx" ON "equipment"("status");

-- CreateIndex
CREATE INDEX "equipment_equipment_class_idx" ON "equipment"("equipment_class");

-- CreateIndex
CREATE INDEX "equipment_condition_idx" ON "equipment"("condition");

-- CreateIndex
CREATE UNIQUE INDEX "technicians_user_id_key" ON "technicians"("user_id");

-- CreateIndex
CREATE INDEX "technicians_status_idx" ON "technicians"("status");

-- CreateIndex
CREATE INDEX "technicians_tech_type_idx" ON "technicians"("tech_type");

-- CreateIndex
CREATE INDEX "technicians_availability_status_idx" ON "technicians"("availability_status");

-- CreateIndex
CREATE INDEX "technicians_region_idx" ON "technicians"("region");

-- CreateIndex
CREATE INDEX "technician_certifications_technician_id_idx" ON "technician_certifications"("technician_id");

-- CreateIndex
CREATE INDEX "technician_certifications_equipment_class_idx" ON "technician_certifications"("equipment_class");

-- CreateIndex
CREATE INDEX "technician_regions_technician_id_idx" ON "technician_regions"("technician_id");

-- CreateIndex
CREATE INDEX "technician_regions_region_idx" ON "technician_regions"("region");

-- CreateIndex
CREATE INDEX "jobs_account_id_idx" ON "jobs"("account_id");

-- CreateIndex
CREATE INDEX "jobs_location_id_idx" ON "jobs"("location_id");

-- CreateIndex
CREATE INDEX "jobs_technician_id_idx" ON "jobs"("technician_id");

-- CreateIndex
CREATE INDEX "jobs_status_idx" ON "jobs"("status");

-- CreateIndex
CREATE INDEX "jobs_job_type_idx" ON "jobs"("job_type");

-- CreateIndex
CREATE INDEX "jobs_scheduled_at_idx" ON "jobs"("scheduled_at");

-- CreateIndex
CREATE INDEX "jobs_priority_idx" ON "jobs"("priority");

-- CreateIndex
CREATE INDEX "job_equipment_job_id_idx" ON "job_equipment"("job_id");

-- CreateIndex
CREATE INDEX "job_equipment_equipment_id_idx" ON "job_equipment"("equipment_id");

-- CreateIndex
CREATE INDEX "job_parts_job_id_idx" ON "job_parts"("job_id");

-- CreateIndex
CREATE INDEX "job_parts_part_id_idx" ON "job_parts"("part_id");

-- CreateIndex
CREATE INDEX "job_photos_job_id_idx" ON "job_photos"("job_id");

-- CreateIndex
CREATE INDEX "job_photos_equipment_id_idx" ON "job_photos"("equipment_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_signoffs_job_id_key" ON "job_signoffs"("job_id");

-- CreateIndex
CREATE INDEX "job_signoffs_status_idx" ON "job_signoffs"("status");

-- CreateIndex
CREATE INDEX "job_signoffs_docusign_envelope_id_idx" ON "job_signoffs"("docusign_envelope_id");

-- CreateIndex
CREATE INDEX "quotes_account_id_idx" ON "quotes"("account_id");

-- CreateIndex
CREATE INDEX "quotes_location_id_idx" ON "quotes"("location_id");

-- CreateIndex
CREATE INDEX "quotes_status_idx" ON "quotes"("status");

-- CreateIndex
CREATE INDEX "quotes_job_type_idx" ON "quotes"("job_type");

-- CreateIndex
CREATE INDEX "quote_line_items_quote_id_idx" ON "quote_line_items"("quote_id");

-- CreateIndex
CREATE INDEX "contracts_account_id_idx" ON "contracts"("account_id");

-- CreateIndex
CREATE INDEX "contracts_status_idx" ON "contracts"("status");

-- CreateIndex
CREATE INDEX "contracts_service_type_idx" ON "contracts"("service_type");

-- CreateIndex
CREATE INDEX "contracts_cadence_idx" ON "contracts"("cadence");

-- CreateIndex
CREATE INDEX "contract_properties_contract_id_idx" ON "contract_properties"("contract_id");

-- CreateIndex
CREATE INDEX "contract_properties_location_id_idx" ON "contract_properties"("location_id");

-- CreateIndex
CREATE UNIQUE INDEX "contract_properties_contract_id_location_id_key" ON "contract_properties"("contract_id", "location_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_account_id_idx" ON "invoices"("account_id");

-- CreateIndex
CREATE INDEX "invoices_location_id_idx" ON "invoices"("location_id");

-- CreateIndex
CREATE INDEX "invoices_job_id_idx" ON "invoices"("job_id");

-- CreateIndex
CREATE INDEX "invoices_contract_id_idx" ON "invoices"("contract_id");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_due_date_idx" ON "invoices"("due_date");

-- CreateIndex
CREATE INDEX "invoice_line_items_invoice_id_idx" ON "invoice_line_items"("invoice_id");

-- CreateIndex
CREATE INDEX "invoice_line_items_job_equipment_id_idx" ON "invoice_line_items"("job_equipment_id");

-- CreateIndex
CREATE INDEX "payment_methods_account_id_idx" ON "payment_methods"("account_id");

-- CreateIndex
CREATE INDEX "payment_methods_status_idx" ON "payment_methods"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_idempotency_key_key" ON "payments"("idempotency_key");

-- CreateIndex
CREATE INDEX "payments_account_id_idx" ON "payments"("account_id");

-- CreateIndex
CREATE INDEX "payments_invoice_id_idx" ON "payments"("invoice_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_idempotency_key_idx" ON "payments"("idempotency_key");

-- CreateIndex
CREATE INDEX "commission_rules_active_idx" ON "commission_rules"("active");

-- CreateIndex
CREATE INDEX "commission_rules_priority_idx" ON "commission_rules"("priority");

-- CreateIndex
CREATE INDEX "commission_rules_tech_type_filter_idx" ON "commission_rules"("tech_type_filter");

-- CreateIndex
CREATE INDEX "commission_rules_job_type_filter_idx" ON "commission_rules"("job_type_filter");

-- CreateIndex
CREATE INDEX "commission_earnings_technician_id_idx" ON "commission_earnings"("technician_id");

-- CreateIndex
CREATE INDEX "commission_earnings_invoice_id_idx" ON "commission_earnings"("invoice_id");

-- CreateIndex
CREATE INDEX "commission_earnings_status_idx" ON "commission_earnings"("status");

-- CreateIndex
CREATE INDEX "commission_earnings_job_id_idx" ON "commission_earnings"("job_id");

-- CreateIndex
CREATE UNIQUE INDEX "parts_sku_key" ON "parts"("sku");

-- CreateIndex
CREATE INDEX "parts_status_idx" ON "parts"("status");

-- CreateIndex
CREATE INDEX "parts_sku_idx" ON "parts"("sku");

-- CreateIndex
CREATE INDEX "part_inventory_part_id_idx" ON "part_inventory"("part_id");

-- CreateIndex
CREATE INDEX "part_inventory_location_id_idx" ON "part_inventory"("location_id");

-- CreateIndex
CREATE INDEX "part_inventory_technician_id_idx" ON "part_inventory"("technician_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_idx" ON "audit_logs"("actor_user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "email_inbox_to_email_idx" ON "email_inbox"("to_email");

-- CreateIndex
CREATE INDEX "email_inbox_sent_at_idx" ON "email_inbox"("sent_at");

-- CreateIndex
CREATE INDEX "esign_envelopes_document_type_document_id_idx" ON "esign_envelopes"("document_type", "document_id");

-- CreateIndex
CREATE INDEX "esign_envelopes_status_idx" ON "esign_envelopes"("status");

-- CreateIndex
CREATE INDEX "esign_envelopes_signer_email_idx" ON "esign_envelopes"("signer_email");

-- CreateIndex
CREATE INDEX "erp_sync_logs_entity_type_entity_id_idx" ON "erp_sync_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "erp_sync_logs_status_idx" ON "erp_sync_logs"("status");

-- CreateIndex
CREATE INDEX "erp_sync_logs_created_at_idx" ON "erp_sync_logs"("created_at");

-- CreateIndex
CREATE INDEX "crm_sync_logs_account_id_idx" ON "crm_sync_logs"("account_id");

-- CreateIndex
CREATE INDEX "crm_sync_logs_entity_type_entity_id_idx" ON "crm_sync_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "crm_sync_logs_status_idx" ON "crm_sync_logs"("status");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_channel_idx" ON "notifications"("channel");

-- CreateIndex
CREATE INDEX "notifications_template_key_idx" ON "notifications"("template_key");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_records_key_key" ON "idempotency_records"("key");

-- CreateIndex
CREATE INDEX "idempotency_records_key_idx" ON "idempotency_records"("key");

-- CreateIndex
CREATE INDEX "idempotency_records_expires_at_idx" ON "idempotency_records"("expires_at");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_users" ADD CONSTRAINT "account_users_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_users" ADD CONSTRAINT "account_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_base_location_id_fkey" FOREIGN KEY ("base_location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_certifications" ADD CONSTRAINT "technician_certifications_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "technicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_regions" ADD CONSTRAINT "technician_regions_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "technicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "technicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_equipment" ADD CONSTRAINT "job_equipment_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_equipment" ADD CONSTRAINT "job_equipment_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_parts" ADD CONSTRAINT "job_parts_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_parts" ADD CONSTRAINT "job_parts_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "parts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_photos" ADD CONSTRAINT "job_photos_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_photos" ADD CONSTRAINT "job_photos_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_photos" ADD CONSTRAINT "job_photos_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_signoffs" ADD CONSTRAINT "job_signoffs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_line_items" ADD CONSTRAINT "quote_line_items_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_properties" ADD CONSTRAINT "contract_properties_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_properties" ADD CONSTRAINT "contract_properties_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_job_equipment_id_fkey" FOREIGN KEY ("job_equipment_id") REFERENCES "job_equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_rules" ADD CONSTRAINT "commission_rules_technician_id_filter_fkey" FOREIGN KEY ("technician_id_filter") REFERENCES "technicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_earnings" ADD CONSTRAINT "commission_earnings_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "technicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_earnings" ADD CONSTRAINT "commission_earnings_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_earnings" ADD CONSTRAINT "commission_earnings_invoice_line_item_id_fkey" FOREIGN KEY ("invoice_line_item_id") REFERENCES "invoice_line_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_earnings" ADD CONSTRAINT "commission_earnings_commission_rule_id_fkey" FOREIGN KEY ("commission_rule_id") REFERENCES "commission_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_earnings" ADD CONSTRAINT "commission_earnings_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "part_inventory" ADD CONSTRAINT "part_inventory_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "parts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "part_inventory" ADD CONSTRAINT "part_inventory_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "part_inventory" ADD CONSTRAINT "part_inventory_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "technicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_sync_logs" ADD CONSTRAINT "crm_sync_logs_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
