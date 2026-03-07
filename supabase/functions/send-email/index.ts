import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { to, subject, html, isTest } = await req.json();

    if (!to || !subject) {
      return new Response(JSON.stringify({ error: "Missing 'to' or 'subject'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's email config
    const { data: config, error: configError } = await supabase
      .from("email_config")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (configError || !config) {
      return new Response(
        JSON.stringify({ error: "No active email configuration found. Please configure your email provider in Settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fromAddress = config.from_name
      ? `${config.from_name} <${config.from_email}>`
      : config.from_email;

    let result;

    if (config.provider === "resend") {
      // Send via Resend API
      if (!config.resend_api_key) {
        return new Response(JSON.stringify({ error: "Resend API key not configured" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.resend_api_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
          subject,
          html: html || "",
        }),
      });

      const resendData = await resendRes.json();

      if (!resendRes.ok) {
        return new Response(
          JSON.stringify({ error: resendData.message || "Resend API error" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      result = { success: true, provider: "resend", messageId: resendData.id };

    } else if (config.provider === "smtp") {
      // Send via SMTP using smtp-client
      if (!config.smtp_host || !config.smtp_username || !config.smtp_password) {
        return new Response(JSON.stringify({ error: "SMTP configuration incomplete" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Use a simple SMTP approach via raw TCP
      // Deno edge functions support limited SMTP - use a fetch-based SMTP relay approach
      // For production, we'll use the Resend fallback or a webhook-based approach
      // Here we demonstrate using a simple mail submission via SMTP
      
      try {
        // Build the email in MIME format
        const boundary = `----=_Part_${Date.now()}`;
        const mimeMessage = [
          `From: ${fromAddress}`,
          `To: ${to}`,
          `Subject: ${subject}`,
          `MIME-Version: 1.0`,
          `Content-Type: multipart/alternative; boundary="${boundary}"`,
          ``,
          `--${boundary}`,
          `Content-Type: text/html; charset=UTF-8`,
          `Content-Transfer-Encoding: 7bit`,
          ``,
          html || "",
          ``,
          `--${boundary}--`,
        ].join("\r\n");

        // Connect to SMTP server
        const port = config.smtp_port || 587;
        const useTls = config.smtp_encryption === "ssl" || config.smtp_encryption === "tls";

        let conn: Deno.TcpConn | Deno.TlsConn;

        if (config.smtp_encryption === "ssl") {
          conn = await Deno.connectTls({
            hostname: config.smtp_host,
            port,
          });
        } else {
          conn = await Deno.connect({
            hostname: config.smtp_host,
            port,
          });
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        async function readResponse(): Promise<string> {
          const buf = new Uint8Array(4096);
          const n = await conn.read(buf);
          return n ? decoder.decode(buf.subarray(0, n)) : "";
        }

        async function sendCommand(cmd: string): Promise<string> {
          await conn.write(encoder.encode(cmd + "\r\n"));
          return await readResponse();
        }

        // Read greeting
        await readResponse();

        // EHLO
        await sendCommand(`EHLO localhost`);

        // STARTTLS if needed
        if (config.smtp_encryption === "tls") {
          await sendCommand("STARTTLS");
          conn = await Deno.startTls(conn as Deno.TcpConn, {
            hostname: config.smtp_host!,
          });
          await sendCommand("EHLO localhost");
        }

        // AUTH LOGIN
        await sendCommand("AUTH LOGIN");
        await sendCommand(btoa(config.smtp_username!));
        const authResult = await sendCommand(btoa(config.smtp_password!));

        if (!authResult.startsWith("235")) {
          conn.close();
          return new Response(
            JSON.stringify({ error: "SMTP authentication failed. Check your credentials." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // MAIL FROM
        await sendCommand(`MAIL FROM:<${config.from_email}>`);
        // RCPT TO
        await sendCommand(`RCPT TO:<${to}>`);
        // DATA
        await sendCommand("DATA");
        // Send message
        await sendCommand(mimeMessage + "\r\n.");
        // QUIT
        await sendCommand("QUIT");

        conn.close();
        result = { success: true, provider: "smtp" };
      } catch (smtpError: any) {
        return new Response(
          JSON.stringify({ error: `SMTP error: ${smtpError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      return new Response(JSON.stringify({ error: "Unknown provider" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log the email if not a test
    if (!isTest) {
      await supabase.from("emails").insert({
        user_id: user.id,
        subject,
        body: html,
        to_address: to,
        from_address: config.from_email,
        direction: "Outbound",
        status: "Sent",
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
