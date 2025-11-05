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

    const contactsParams = isAdmin ? {} : { assignedTo: ghlUserId };
    const contactsResponse = await callMCPTool(
      'contacts_get-contacts',
      contactsParams,
      user.role,
      ghlUserId
    );

    const contacts = contactsResponse.data?.contacts || [];
    const leads = contacts.length;

    const opportunitiesParams = isAdmin ? {} : { assignedTo: ghlUserId };
    const opportunitiesResponse = await callMCPTool(
      'opportunities_search-opportunity',
      opportunitiesParams,
      user.role,
      ghlUserId
    );

    const allOpportunities = opportunitiesResponse.data?.opportunities || [];

    const wonOpportunities = allOpportunities.filter((opp: any) => opp.status === 'won');

    const revenue = wonOpportunities.reduce((sum: number, opp: any) => {
      const value = parseFloat(opp.monetaryValue || 0);
      return sum + value;
    }, 0);

    const opportunities = allOpportunities.length;

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
