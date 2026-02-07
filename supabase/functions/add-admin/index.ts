import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Missing authorization header", { status: 401 });
    }

    // Get current user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Check if caller is admin
    const { data: isAdmin } = await supabase.rpc("is_admin", {
      _user_id: user.id,
    });

    if (!isAdmin) {
      return new Response("Only admins can add other admins", { status: 403 });
    }

    // Parse request body
    const { email } = await req.json();

    if (!email) {
      return new Response("Email is required", { status: 400 });
    }

    // Find user by email
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();

    if (getUserError) {
      return new Response("Failed to list users", { status: 500 });
    }

    const targetUser = users.find((u) => u.email === email);

    if (!targetUser) {
      return new Response("User not found", { status: 404 });
    }

    // Check if already admin
    const { data: existingAdmin } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", targetUser.id)
      .single();

    if (existingAdmin) {
      return new Response("User is already an admin", { status: 400 });
    }

    // Add to admin_users
    const { error: insertError } = await supabase.from("admin_users").insert({
      user_id: targetUser.id,
      email: email,
    });

    if (insertError) {
      return new Response(`Failed to add admin: ${insertError.message}`, {
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${email} has been added as an admin`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
});
