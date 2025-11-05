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

    // Use claude-3-5-sonnet-20241022 if available, otherwise fallback to claude-3-5-sonnet-20240620
    const modelToUse = model || 'claude-3-5-sonnet-20240620';

    console.log('🤖 Processing AI request with', messages?.length || 0, 'messages');
    console.log('📦 Using model:', modelToUse);

    const payload = {
      model: modelToUse,
      max_tokens,
      system,
      messages,
      tools,
    };

    let response: Response | null = null;
    let lastError: string = '';

    // Try primary API key first
    if (ANTHROPIC_API_KEY) {
      console.log('🔑 Trying primary API key...');
      response = await callAnthropicAPI(ANTHROPIC_API_KEY, payload);
      
      if (response.ok) {
        console.log('✅ Primary API key worked');
      } else {
        const errorText = await response.text();
        lastError = errorText;
        console.log('⚠️ Primary API key failed:', response.status, errorText);
        
        // Check if it's a credit issue or model not found
        if (errorText.includes('credit balance') || errorText.includes('not_found_error') || response.status === 400) {
          console.log('💳 Issue detected, trying alternative key...');
          response = null;
        }
      }
    }

    // Fallback to alternative API key if primary failed or not available
    if (!response && ANTHROPIC_API_KEY_ALTERNATIVE) {
      console.log('🔄 Using alternative API key...');
      response = await callAnthropicAPI(ANTHROPIC_API_KEY_ALTERNATIVE, payload);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Alternative API key also failed:', response.status, errorText);
        throw new Error(`Both API keys failed. Last error: ${errorText}`);
      }
      console.log('✅ Alternative API key worked');
    }

    if (!response) {
      throw new Error(`API call failed: ${lastError}`);
    }

    const data = await response.json();
    console.log('✅ AI Response received');

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