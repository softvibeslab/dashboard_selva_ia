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

    console.log('📊 Fetching metrics for:', { isAdmin, ghlUserId, userRole: user.role });

    const contactsParams = isAdmin ? {} : { assignedTo: ghlUserId };
    console.log('📞 Calling contacts_get-contacts with params:', contactsParams);

    const contactsResponse = await callMCPTool(
      'contacts_get-contacts',
      contactsParams,
      user.role,
      ghlUserId
    );

    console.log('📞 Contacts response:', contactsResponse);

    const contacts = contactsResponse.data?.contacts || [];
    const leads = contacts.length;

    console.log('✅ Total leads:', leads);

    const opportunitiesParams = isAdmin ? {} : { assignedTo: ghlUserId };
    console.log('🎯 Calling opportunities_search-opportunity with params:', opportunitiesParams);

    const opportunitiesResponse = await callMCPTool(
      'opportunities_search-opportunity',
      opportunitiesParams,
      user.role,
      ghlUserId
    );

    console.log('🎯 Opportunities response:', opportunitiesResponse);

    const allOpportunities = opportunitiesResponse.data?.opportunities || [];

    console.log('✅ Total opportunities:', allOpportunities.length);

    const wonOpportunities = allOpportunities.filter((opp: any) => opp.status === 'won');

    console.log('💰 Won opportunities:', wonOpportunities.length);

    const revenue = wonOpportunities.reduce((sum: number, opp: any) => {
      const value = parseFloat(opp.monetaryValue || 0);
      return sum + value;
    }, 0);

    const opportunities = allOpportunities.length;

    const conversion = leads > 0 ? Math.round((opportunities / leads) * 100) : 0;

    console.log('📊 Final metrics:', { leads, opportunities, revenue, conversion });

    return {
      leads,
      opportunities,
      revenue,
      conversion,
    };
  } catch (error) {
    console.error('❌ Error fetching metrics:', error);
    return {
      leads: 0,
      opportunities: 0,
      revenue: 0,
      conversion: 0,
    };
  }
}
