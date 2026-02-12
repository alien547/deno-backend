let messages: Array<{ user: string; text: string; timestamp: number }> = [];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

Deno.serve(async (req: Request): Promise
  const url = new URL(req.url);
  const method = req.method;

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (url.pathname === '/api/messages' && method === 'GET') {
    返回新的响应(JSON.stringify(消息), {
      状态：200，
      头部信息: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  if (url.pathname === '/api/messages' && method === 'POST') {
    尝试 {
      const body = await req.json();
      const { user, text } = body;
      if (!text || typeof text !== 'string' || text.trim() === '') {
        return new Response(JSON.stringify({ error: "消息不能为空" }), {
          状态：400
          头部信息: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      const newMessage = {
        用户: user?.trim() || "匿名"
        文本：文本.trim()
        时间戳: Date.now(),
      }
      消息.push(新消息);
      if (消息的数量 > 50) 消息 = 消息.slice(-50);
      return new Response(JSON.stringify({ success: true }), {
        状态：200，
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch {
      return new Response(JSON.stringify({ error: "无效的 JSON" }), {
        状态：400
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  }

  return new Response(JSON.stringify({ error: "未找到" }), {
    状态: 404
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});
