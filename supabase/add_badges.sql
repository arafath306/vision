/* 
  SQL Migration to add the "badge" column to the users table.
  Please run this in the Supabase SQL Editor.
*/

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS badge text DEFAULT 'Newbie';
