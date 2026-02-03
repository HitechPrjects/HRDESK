import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('PROJECT_URL')!;
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Check if admin already exists
    const { data: existingAdmin } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    if (existingAdmin && existingAdmin.length > 0) {
      return new Response(
        JSON.stringify({ message: 'Admin already exists', exists: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin user
    const { data: adminUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@hrms.local',
      password: 'admin@123',
      email_confirm: true,
      user_metadata: {
        first_name: 'System',
        last_name: 'Admin'
      }
    });

    if (createError) {
      console.error('Error creating admin:', createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update admin profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        first_name: 'System',
        last_name: 'Admin',
        employee_id: 'ADMIN001',
        joining_date: new Date().toISOString().split('T')[0]
      })
      .eq('user_id', adminUser.user.id);

    if (profileError) {
      console.error('Error updating admin profile:', profileError);
    }

    // Assign admin role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: adminUser.user.id,
        role: 'admin'
      });

    if (roleError) {
      console.error('Error assigning admin role:', roleError);
      return new Response(
        JSON.stringify({ error: 'Failed to assign admin role' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin user seeded successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin user created',
        credentials: {
          email: 'admin@hrms.local',
          password: 'admin@123'
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});