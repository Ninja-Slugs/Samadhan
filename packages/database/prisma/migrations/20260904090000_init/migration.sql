-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('citizen', 'admin', 'university_admin', 'student', 'faculty', 'industry');

-- CreateEnum
CREATE TYPE "ProblemStatus" AS ENUM ('submitted', 'under_review', 'validated', 'prioritized', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected', 'duplicate', 'archived');

-- CreateEnum
CREATE TYPE "ProblemSeverity" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('routine', 'elevated', 'urgent', 'emergency');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('image', 'video', 'document', 'voice');

-- CreateEnum
CREATE TYPE "AiAnalysisStatus" AS ENUM ('pending', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('draft', 'open', 'interested', 'accepted', 'rejected', 'withdrawn');

-- CreateEnum
CREATE TYPE "ProjectStage" AS ENUM ('research', 'solution_design', 'prototype', 'testing', 'pilot', 'deployment', 'impact_measurement');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('draft', 'submitted', 'approved', 'active', 'review', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "AppRole" NOT NULL DEFAULT 'citizen',
    "phone" TEXT,
    "organization_name" TEXT,
    "district" TEXT,
    "city" TEXT,
    "state" TEXT,
    "avatar_url" TEXT,
    "bio" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified_at" TIMESTAMP(3),
    "last_seen_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "university_id" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "password_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_categories" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "default_priority_weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problems" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "citizen_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category_id" TEXT,
    "status" "ProblemStatus" NOT NULL DEFAULT 'submitted',
    "severity" "ProblemSeverity",
    "urgency_level" "UrgencyLevel",
    "people_affected" INTEGER,
    "priority_score" DOUBLE PRECISION,
    "district" TEXT,
    "city" TEXT,
    "state" TEXT,
    "address" TEXT,
    "gps_lat" DOUBLE PRECISION,
    "gps_lng" DOUBLE PRECISION,
    "submitted_source" TEXT NOT NULL DEFAULT 'web',
    "rejection_reason" TEXT,
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_media" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "media_type" "MediaType" NOT NULL,
    "storage_bucket" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "caption" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "problem_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_ai_analysis" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "status" "AiAnalysisStatus" NOT NULL DEFAULT 'pending',
    "model_name" TEXT,
    "input_hash" TEXT,
    "category_guess" TEXT,
    "subcategory_guess" TEXT,
    "severity_guess" TEXT,
    "priority_suggestion" DOUBLE PRECISION,
    "required_expertise" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "suggested_solution_areas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "summary" TEXT,
    "reasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "uncertainties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "confidence_score" DOUBLE PRECISION,
    "needs_review" BOOLEAN NOT NULL DEFAULT true,
    "analysis_json" JSONB,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_ai_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_duplicates" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "similar_problem_id" TEXT NOT NULL,
    "similarity_score" DOUBLE PRECISION NOT NULL,
    "text_score" DOUBLE PRECISION,
    "location_score" DOUBLE PRECISION,
    "category_score" DOUBLE PRECISION,
    "date_score" DOUBLE PRECISION,
    "review_status" TEXT NOT NULL DEFAULT 'pending',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "problem_duplicates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "priority_scores" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "severity_weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "urgency_weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "population_weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "duplicate_weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "geographic_weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "social_impact_weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "final_score" DOUBLE PRECISION NOT NULL,
    "explanation" JSONB NOT NULL,
    "manual_override" BOOLEAN NOT NULL DEFAULT false,
    "calculated_by" TEXT,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "priority_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_status_events" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "from_status" "ProblemStatus",
    "to_status" "ProblemStatus" NOT NULL,
    "actor_id" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "problem_status_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "state" TEXT,
    "district" TEXT,
    "city" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "capacity_score" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "university_expertise" (
    "id" TEXT NOT NULL,
    "university_id" TEXT NOT NULL,
    "expertise_tag" TEXT NOT NULL,
    "department" TEXT,
    "lab_name" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "university_expertise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "innovation_challenges" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "problem_summary" TEXT NOT NULL,
    "location" TEXT,
    "category_id" TEXT,
    "priority_score" DOUBLE PRECISION,
    "required_expertise" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "expected_outcomes" JSONB,
    "suggested_timeline" TEXT,
    "estimated_budget" DOUBLE PRECISION,
    "success_criteria" JSONB,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'draft',
    "assigned_university_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "innovation_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "university_id" TEXT,
    "title" TEXT NOT NULL,
    "current_stage" "ProjectStage" NOT NULL DEFAULT 'research',
    "status" "ProjectStatus" NOT NULL DEFAULT 'draft',
    "progress_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "public_visibility" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_members" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "member_role" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_milestones" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order_no" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "progress_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_updates" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "update_type" TEXT NOT NULL DEFAULT 'progress',
    "summary" TEXT NOT NULL,
    "details" TEXT,
    "posted_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_district_idx" ON "users"("district");

-- CreateIndex
CREATE INDEX "auth_accounts_user_id_idx" ON "auth_accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_accounts_provider_provider_account_id_key" ON "auth_accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refresh_token_hash_key" ON "sessions"("refresh_token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "email_verification_tokens_user_id_idx" ON "email_verification_tokens"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "problem_categories_slug_key" ON "problem_categories"("slug");

-- CreateIndex
CREATE INDEX "problem_categories_parent_id_idx" ON "problem_categories"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "problems_public_id_key" ON "problems"("public_id");

-- CreateIndex
CREATE INDEX "problems_status_idx" ON "problems"("status");

-- CreateIndex
CREATE INDEX "problems_category_id_idx" ON "problems"("category_id");

-- CreateIndex
CREATE INDEX "problems_district_idx" ON "problems"("district");

-- CreateIndex
CREATE INDEX "problems_citizen_id_idx" ON "problems"("citizen_id");

-- CreateIndex
CREATE INDEX "problems_priority_score_idx" ON "problems"("priority_score" DESC);

-- CreateIndex
CREATE INDEX "problems_created_at_idx" ON "problems"("created_at" DESC);

-- CreateIndex
CREATE INDEX "problem_media_problem_id_idx" ON "problem_media"("problem_id");

-- CreateIndex
CREATE UNIQUE INDEX "problem_ai_analysis_problem_id_key" ON "problem_ai_analysis"("problem_id");

-- CreateIndex
CREATE INDEX "problem_duplicates_similarity_score_idx" ON "problem_duplicates"("similarity_score" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "problem_duplicates_problem_id_similar_problem_id_key" ON "problem_duplicates"("problem_id", "similar_problem_id");

-- CreateIndex
CREATE UNIQUE INDEX "priority_scores_problem_id_key" ON "priority_scores"("problem_id");

-- CreateIndex
CREATE INDEX "priority_scores_final_score_idx" ON "priority_scores"("final_score" DESC);

-- CreateIndex
CREATE INDEX "problem_status_events_problem_id_idx" ON "problem_status_events"("problem_id");

-- CreateIndex
CREATE UNIQUE INDEX "universities_name_key" ON "universities"("name");

-- CreateIndex
CREATE INDEX "universities_district_idx" ON "universities"("district");

-- CreateIndex
CREATE INDEX "universities_capacity_score_idx" ON "universities"("capacity_score" DESC);

-- CreateIndex
CREATE INDEX "university_expertise_university_id_idx" ON "university_expertise"("university_id");

-- CreateIndex
CREATE INDEX "university_expertise_expertise_tag_idx" ON "university_expertise"("expertise_tag");

-- CreateIndex
CREATE UNIQUE INDEX "innovation_challenges_problem_id_key" ON "innovation_challenges"("problem_id");

-- CreateIndex
CREATE INDEX "innovation_challenges_status_idx" ON "innovation_challenges"("status");

-- CreateIndex
CREATE INDEX "innovation_challenges_priority_score_idx" ON "innovation_challenges"("priority_score" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "projects_challenge_id_key" ON "projects"("challenge_id");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_current_stage_idx" ON "projects"("current_stage");

-- CreateIndex
CREATE INDEX "project_members_user_id_idx" ON "project_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_project_id_user_id_key" ON "project_members"("project_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_milestones_project_id_order_no_key" ON "project_milestones"("project_id", "order_no");

-- CreateIndex
CREATE INDEX "project_updates_project_id_created_at_idx" ON "project_updates"("project_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_recipient_id_created_at_idx" ON "notifications"("recipient_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_recipient_id_read_at_idx" ON "notifications"("recipient_id", "read_at");

-- CreateIndex
CREATE INDEX "activity_logs_entity_type_entity_id_idx" ON "activity_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "activity_logs_actor_id_idx" ON "activity_logs"("actor_id");

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_accounts" ADD CONSTRAINT "auth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_categories" ADD CONSTRAINT "problem_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "problem_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problems" ADD CONSTRAINT "problems_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problems" ADD CONSTRAINT "problems_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problems" ADD CONSTRAINT "problems_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "problem_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_media" ADD CONSTRAINT "problem_media_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_media" ADD CONSTRAINT "problem_media_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_ai_analysis" ADD CONSTRAINT "problem_ai_analysis_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_duplicates" ADD CONSTRAINT "problem_duplicates_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_duplicates" ADD CONSTRAINT "problem_duplicates_similar_problem_id_fkey" FOREIGN KEY ("similar_problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "priority_scores" ADD CONSTRAINT "priority_scores_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_status_events" ADD CONSTRAINT "problem_status_events_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "university_expertise" ADD CONSTRAINT "university_expertise_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innovation_challenges" ADD CONSTRAINT "innovation_challenges_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innovation_challenges" ADD CONSTRAINT "innovation_challenges_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "problem_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innovation_challenges" ADD CONSTRAINT "innovation_challenges_assigned_university_id_fkey" FOREIGN KEY ("assigned_university_id") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "innovation_challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_updates" ADD CONSTRAINT "project_updates_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_updates" ADD CONSTRAINT "project_updates_posted_by_fkey" FOREIGN KEY ("posted_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

