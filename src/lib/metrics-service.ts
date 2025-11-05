import { User } from './supabase';
import { callMCPTool } from './ghl-mcp';

export interface Metrics {
  leads: number;
  opportunities: number;
  revenue: number;
  conversion: number;
}

export async function fetchMetrics(user: User): Promise<Metrics> {
  try {
    const isAdmin = user.role === 'admin';
    const ghlUserId = user.ghl_user_id;

    const contactsPromise = callMCPTool(
      'contacts_get-contacts',
      isAdmin ? {} : { assignedTo: ghlUserId },
      user.role,
      ghlUserId
    );

    const opportunitiesPromise = callMCPTool(
      'opportunities_get-pipelines',
      {},
      user.role,
      ghlUserId
    );

    const [contactsResponse, opportunitiesResponse] = await Promise.all([
      contactsPromise,
      opportunitiesPromise,
    ]);

    const contacts = contactsResponse.data?.contacts || [];
    const pipelines = opportunitiesResponse.data?.pipelines || [];

    let opportunities = 0;
    let revenue = 0;

    for (const pipeline of pipelines) {
      const pipelineOpps = await callMCPTool(
        'opportunities_get-opportunities',
        { pipelineId: pipeline.id },
        user.role,
        ghlUserId
      );

      const opps = pipelineOpps.data?.opportunities || [];

      const filteredOpps = isAdmin
        ? opps
        : opps.filter((opp: any) => opp.assignedTo === ghlUserId);

      opportunities += filteredOpps.length;

      for (const opp of filteredOpps) {
        if (opp.monetaryValue) {
          revenue += parseFloat(opp.monetaryValue);
        }
      }
    }

    const leads = contacts.length;
    const conversion = leads > 0 ? Math.round((opportunities / leads) * 100) : 0;

    return {
      leads,
      opportunities,
      revenue,
      conversion,
    };
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return {
      leads: 0,
      opportunities: 0,
      revenue: 0,
      conversion: 0,
    };
  }
}
