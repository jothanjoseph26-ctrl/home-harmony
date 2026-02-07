import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Missing authorization header", { status: 401, headers: corsHeaders });
    }

    // Get current user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    // Check if caller is admin
    const { data: isAdmin } = await supabase.rpc("is_admin", {
      _user_id: user.id,
    });

    if (!isAdmin) {
      return new Response("Only admins can remove other admins", { status: 403, headers: corsHeaders });
    }

    // Parse request body
    const { adminId } = await req.json();

    if (!adminId) {
      return new Response("Admin ID is required", { status: 400, headers: corsHeaders });
    }

    // Get the admin to be removed
    const { data: adminToRemove, error: fetchError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", adminId)
      .single();

    if (fetchError || !adminToRemove) {
      return new Response("Admin not found", { status: 404, headers: corsHeaders });
    }

    // Prevent self-removal
    if (adminToRemove.user_id === user.id) {
      return new Response("You cannot remove yourself as admin", { status: 400, headers: corsHeaders });
    }

    // Count remaining admins
    const { count } = await supabase
      .from("admin_users")
      .select("*", { count: "exact", head: true });

    if (count !== null && count <= 1) {
      return new Response("Cannot remove the last admin", { status: 400, headers: corsHeaders });
    }

    // Remove from admin_users
    const { error: deleteError } = await supabase
      .from("admin_users")
      .delete()
      .eq("id", adminId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return new Response(`Failed to remove admin: ${deleteError.message}`, {
        status: 500,
        headers: corsHeaders,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${adminToRemove.email} has been removed as an admin`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(`Error: ${error.message}`, { status: 500, headers: corsHeaders });
  }
});
