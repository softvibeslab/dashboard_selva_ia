import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function callAnthropicAPI(apiKey: string, payload: any): Promise<Response> {
  return await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(payload),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    const ANTHROPIC_API_KEY_ALTERNATIVE = Deno.env.get('ANTHROPIC_API_KEY_ALTERNATIVE');
    
    if (!ANTHROPIC_API_KEY && !ANTHROPIC_API_KEY_ALTERNATIVE) {
      throw new Error('No API keys configured');
    }

    const { messages, system, tools, model, max_tokens = 4096 } = await req.json();

    // Try different models in order of preference
    const modelsToTry = [
      model || 'claude-3-5-sonnet-20241022',
      'claude-3-5-sonnet-20240620',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ];

    console.log('🤖 Processing AI request with', messages?.length || 0, 'messages');

    const payload = {
      model: modelsToTry[0],
      max_tokens,
      system,
      messages,
      tools,
    };

    let response: Response | null = null;
    let lastError: string = '';
    let workingModel: string = '';

    // Try alternative API key first since primary seems to have issues
    const keysToTry = [
      { key: ANTHROPIC_API_KEY_ALTERNATIVE, name: 'alternative' },
      { key: ANTHROPIC_API_KEY, name: 'primary' },
    ].filter(k => k.key);

    for (const { key, name } of keysToTry) {
      for (const modelName of modelsToTry) {
        console.log(`🔑 Trying ${name} API key with model: ${modelName}`);
        payload.model = modelName;
        
        response = await callAnthropicAPI(key!, payload);
        
        if (response.ok) {
          console.log(`✅ Success with ${name} API key and model: ${modelName}`);
          workingModel = modelName;
          break;
        } else {
          const errorText = await response.text();
          lastError = errorText;
          console.log(`⚠️ ${name} key + ${modelName} failed:`, response.status, errorText);
          response = null;
        }
      }
      
      if (response) break;
    }

    if (!response) {
      throw new Error(`All API keys and models failed. Last error: ${lastError}`);
    }

    const data = await response.json();
    console.log(`✅ AI Response received using model: ${workingModel}`);

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('❌ Edge Function Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});