import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed frontend origins
const FRONTEND_URLS = ["https://hrdesk.htge.org"];

Deno.serve(async (req) => {
  // Dynamic CORS handling
  const origin = req.headers.get("Origin") || "";
  const allowOrigin = FRONTEND_URLS.includes(origin) ? origin : FRONTEND_URLS[0];

  const corsHeaders = {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "Authorization, X-Client-Info, Apikey, Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
  };

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Authorization header check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Regular client to get caller info
    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: callingUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !callingUser) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check caller role
    const { data: callerRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", callingUser.id)
      .single();

    if (!callerRole || (callerRole.role !== "admin" && callerRole.role !== "hr")) {
      return new Response(
        JSON.stringify({ error: "Only admin and HR can create users" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, password, first_name, last_name, role, department_id, designation_id, phone, date_of_birth, joining_date, employee_id, reporting_manager } = await req.json();

    // Validate required fields
    if (!email || !first_name || !last_name || !role || (!password && callerRole.role === "admin")) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // HR restriction: can only create employees
    if (callerRole.role === "hr" && role !== "employee") {
      return new Response(
        JSON.stringify({ error: "HR can only create employee accounts" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create user in auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name, last_name },
    });

    if (createError) {
      console.error("Error creating user:", createError);
      const errorMessage = createError.message.includes("email")
        ? "A user with this email address already exists"
        : createError.message;

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update profile with details
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        user_id: newUser.user.id,
        first_name,
        last_name,
        phone,
        date_of_birth,
        department_id,
        designation_id,
        joining_date: joining_date || new Date().toISOString().split("T")[0],
        employee_id,
        reporting_manager,
      });

    if (profileError) {
      return new Response(
        JSON.stringify({ error: "Failed to create profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Assign role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newUser.user.id, role });

    if (roleError) {
      console.error("Error assigning role:", roleError);
      return new Response(
        JSON.stringify({ error: "Failed to assign role" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize leave balances
    const { data: leaveTypes } = await supabaseAdmin
      .from("leave_types")
      .select("id, default_days");

    if (leaveTypes && leaveTypes.length > 0) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("user_id", newUser.user.id)
        .single();

      if (profile) {
        const leaveBalances = leaveTypes.map(lt => ({
          profile_id: profile.id,
          leave_type_id: lt.id,
          total_days: lt.default_days,
          used_days: 0,
          year: new Date().getFullYear(),
        }));

        await supabaseAdmin.from("leave_balances").insert(leaveBalances);
      }
    }

    console.log("User created successfully:", newUser.user.email);

    return new Response(
      JSON.stringify({ success: true, user: { id: newUser.user.id, email: newUser.user.email } }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
