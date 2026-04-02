'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function createAccountFromForm(formId: string) {
    // Requires using the service role key to bypass RLS and use auth admin API
    if (!supabaseServiceKey) throw new Error('Missing service role key')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 1. Get the form details
    const { data: form, error: formError } = await supabase
        .from('registration_forms')
        .select('*, users:submitted_by(*)')
        .eq('id', formId)
        .single()
        
    if (formError || !form) {
        throw new Error('Form not found')
    }
    
    if (form.status === 'ACCOUNT_CREATED') {
        throw new Error('Account already created from this form')
    }

    // Determine the sponsor (trainer/leader) based on the user who submitted it
    // If the submitter is a MEMBER, the new user will share the same trainer/leader
    // Or maybe the submitter becomes the referral? "ager jemon activation request jeto ei vabe account korleo...". 
    // Usually, the member who submits the form becomes the referral, but the user didn't specify. 
    // I will set the referred_by to the submitter. And their trainer_id / leader_id.
    const submitter = form.users
    const referredBy = submitter.id
    const trainerId = submitter.role === 'TEAM_TRAINER' ? submitter.id : submitter.trainer_id
    const leaderId = submitter.role === 'TEAM_LEADER' ? submitter.id : submitter.leader_id

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers.users.find(u => u.user_metadata?.whatsapp === form.account_number)
    
    let targetUserId = existingUser?.id

    if (!targetUserId) {
        // 2. Create Auth User
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: form.email || undefined,
            password: form.password,
            email_confirm: true,
            user_metadata: {
                full_name: form.account_name,
                whatsapp: form.account_number
            }
        })

        if (authError) throw authError
        targetUserId = authUser.user.id
    }

    // 3. The `handle_new_auth_user` trigger likely inserted a public.users row. We need to update it.
    // Wait briefly to ensure trigger finishes
    await new Promise(r => setTimeout(r, 1000))

    const { error: updateError } = await supabase
        .from('users')
        .update({
            full_name: form.account_name,
            whatsapp: form.account_number,
            referred_by: referredBy,
            trainer_id: trainerId,
            leader_id: leaderId,
            status: 'INACTIVE' // Remains inactive until manually activated via activation requests
        })
        .eq('id', targetUserId)

    if (updateError) throw updateError

    // 4. Update form status
    await supabase
        .from('registration_forms')
        .update({ status: 'ACCOUNT_CREATED' })
        .eq('id', formId)

    // 5. Send Notification to the TL/TR (the person whose team it's in)
    // We notify the team trainer, if none we notify the team leader.
    const notifyUserId = trainerId || leaderId
    if (notifyUserId) {
        await supabase.from('form_notifications').insert({
            form_id: form.id,
            user_id: notifyUserId,
            message: `Account created for form ${form.employee_id} (${form.account_name}).`,
            whatsapp: form.account_number
        })
    }

    return { success: true }
}
