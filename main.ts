// 打开 KV 数据库
const kv = await Deno.openKv();

// 设置允许的来源（你的前端域名）
const allowedOrigin = 'https://alien547.pages.dev';

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const method = req.method;

  // 预检请求（OPTIONS）——必须处理，否则浏览器会拦截
  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // GET 请求：从 KV 读取消息
  if (url.pathname === "/api/messages" && method === "GET") {
    const result = await kv.get(["messages"]);
    const messages = result.value || [];
    return new Response(JSON.stringify(messages), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // POST 请求：写入新消息
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

      // 原子更新 KV
      const atomicOp = kv.atomic();
      const res = await kv.get(["messages"]);
      const currentMessages = res.value || [];
      const updatedMessages = [...currentMessages, newMessage];
      if (updatedMessages.length > 50) {
        updatedMessages = updatedMessages.slice(-50);
      }
      atomicOp.check(res).set(["messages"], updatedMessages);
      const commitRes = await atomicOp.commit();

      if (!commitRes.ok) {
        return new Response(JSON.stringify({ error: "数据冲突，请重试" }), {
          status: 409,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

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

  // 404 处理
  return new Response(JSON.stringify({ error: "Not Found" }), {
    status: 404,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});
