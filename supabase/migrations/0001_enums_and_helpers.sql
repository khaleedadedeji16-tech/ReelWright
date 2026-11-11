-- 0001: enums (fixed lists) and the shared updated_at trigger function.

-- People
create type public.user_role as enum ('author', 'creator', 'fanvue');
create type public.id_check_status as enum ('not_started', 'pending', 'passed', 'failed');

-- Creative work
create type public.book_status as enum ('draft', 'ready', 'archived');
create type public.persona_kind as enum ('verified_self', 'ai_character');
create type public.approval_status as enum ('pending', 'approved', 'rejected');
create type public.project_kind as enum (
  'trailer', 'short_video', 'image_post', 'carousel', 'thumbnail',
  'feed_post', 'paid_set', 'clip', 'teaser'
);
create type public.project_status as enum ('draft', 'in_progress', 'completed', 'archived');
create type public.aspect_ratio as enum ('16:9', '9:16', '1:1', '4:5');
create type public.scene_status as enum ('draft', 'generating', 'ready', 'failed');
create type public.file_kind as enum (
  'manuscript', 'cover', 'reference_image', 'keyframe', 'video_clip',
  'final_video', 'image', 'audio', 'other'
);
create type public.safety_status as enum ('not_checked', 'passed', 'held', 'blocked');

-- Generation
create type public.workflow_kind as enum ('image', 'video_shot');
create type public.job_kind as enum ('image', 'video_shot', 'assemble');
create type public.job_status as enum ('queued', 'running', 'succeeded', 'failed', 'cancelled');
create type public.gpu_source as enum ('site', 'own_runpod', 'own_pc');
create type public.gpu_provider as enum ('runpod', 'own_pc');
-- Shared by gpu_connections and connected_accounts.
create type public.connection_status as enum ('pending', 'active', 'expired', 'error', 'revoked');

-- Money
create type public.credit_transaction_kind as enum (
  'purchase', 'hold', 'charge', 'release', 'refund', 'grant'
);

-- Publishing
create type public.social_platform as enum (
  'instagram', 'tiktok', 'youtube', 'facebook', 'x', 'fanvue'
);
create type public.post_status as enum ('draft', 'scheduled', 'posting', 'posted', 'failed');

-- Keeps updated_at current. Attached to every table as a trigger.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public, anon, authenticated;
