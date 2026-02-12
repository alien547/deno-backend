let messages = [];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const method = req.method;

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (url.pathname === "/api/messages" && method === "GET") {
    return new Response(JSON.stringify(messages), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  if (url.pathname === "/api/messages" && method === "POST") {
    try {
      const body = await req.json();
      const { user, text } = body;
      if (!text || typeof text !== "string" || text.trim() === "") {
        return new Response(JSON.stringify({ error: "消息不能为空" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      const newMessage = {
        user: (user && user.trim()) || "匿名",
        text: text.trim(),
        timestamp: Date.now(),
      };
      messages.push(newMessage);
      if (messages.length > 50) messages = messages.slice(-50);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch {
      return new Response(JSON.stringify({ error: "无效的 JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  }

  return new Response(JSON.stringify({ error: "Not Found" }), {
    status: 404,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});
