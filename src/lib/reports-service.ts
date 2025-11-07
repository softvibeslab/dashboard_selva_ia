import { User } from './supabase';
import { callMCPTool } from './ghl-mcp';
import { fetchRealMetrics } from './metrics-service';

// ==================== TYPES ====================

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  sections: ReportSection[];
  icon: string;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'metrics' | 'pipeline' | 'activities' | 'deals' | 'contacts' | 'chart';
  enabled: boolean;
}

export interface ScheduledReport {
  id: string;
  templateId: string;
  templateName: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  recipients: string[];
  active: boolean;
  lastSent?: Date;
  nextScheduled: Date;
}

export interface ReportHistory {
  id: string;
  templateName: string;
  generatedAt: Date;
  sentTo: string[];
  type: 'manual' | 'scheduled';
  status: 'sent' | 'failed' | 'pending';
  downloadUrl?: string;
}

export interface GeneratedReport {
  template: ReportTemplate;
  data: ReportData;
  generatedAt: Date;
  user: User;
}

export interface ReportData {
  metrics?: {
    leads: number;
    opportunities: number;
    revenue: number;
    conversion: number;
  };
  pipeline?: {
    stageName: string;
    count: number;
    value: number;
  }[];
  recentActivities?: {
    type: string;
    description: string;
    date: Date;
  }[];
  topDeals?: {
    id: string;
    name: string;
    value: number;
    stage: string;
    probability: number;
  }[];
  contactStats?: {
    total: number;
    active: number;
    newThisWeek: number;
  };
}

// ==================== TEMPLATES ====================

export const DEFAULT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'daily-summary',
    name: 'Resumen Diario',
    description: 'Métricas clave y actividades del día',
    type: 'daily',
    icon: '📊',
    sections: [
      { id: 'metrics', title: 'Métricas del Día', type: 'metrics', enabled: true },
      { id: 'activities', title: 'Actividades Recientes', type: 'activities', enabled: true },
      { id: 'deals', title: 'Deals Actualizados', type: 'deals', enabled: true },
    ],
  },
  {
    id: 'weekly-performance',
    name: 'Reporte Semanal',
    description: 'Análisis de rendimiento semanal completo',
    type: 'weekly',
    icon: '📈',
    sections: [
      { id: 'metrics', title: 'Métricas de la Semana', type: 'metrics', enabled: true },
      { id: 'pipeline', title: 'Estado del Pipeline', type: 'pipeline', enabled: true },
      { id: 'deals', title: 'Top Deals', type: 'deals', enabled: true },
      { id: 'contacts', title: 'Nuevos Contactos', type: 'contacts', enabled: true },
    ],
  },
  {
    id: 'monthly-executive',
    name: 'Reporte Ejecutivo Mensual',
    description: 'Vista ejecutiva completa del mes',
    type: 'monthly',
    icon: '📋',
    sections: [
      { id: 'metrics', title: 'Métricas del Mes', type: 'metrics', enabled: true },
      { id: 'pipeline', title: 'Pipeline Analysis', type: 'pipeline', enabled: true },
      { id: 'deals', title: 'Deals Cerrados', type: 'deals', enabled: true },
      { id: 'contacts', title: 'Crecimiento de Contactos', type: 'contacts', enabled: true },
      { id: 'chart', title: 'Gráficos de Tendencia', type: 'chart', enabled: true },
    ],
  },
  {
    id: 'pipeline-snapshot',
    name: 'Snapshot de Pipeline',
    description: 'Estado actual del pipeline de ventas',
    type: 'custom',
    icon: '🎯',
    sections: [
      { id: 'pipeline', title: 'Pipeline por Etapa', type: 'pipeline', enabled: true },
      { id: 'deals', title: 'Deals en Progreso', type: 'deals', enabled: true },
    ],
  },
];

// ==================== IN-MEMORY DATA STORES ====================

// Scheduled reports store (in-memory, would be DB in production)
const scheduledReportsStore: Map<string, ScheduledReport[]> = new Map();

// Report history store (in-memory, would be DB in production)
const reportHistoryStore: Map<string, ReportHistory[]> = new Map();

// ==================== REPORT GENERATION ====================

export async function generateReport(
  templateId: string,
  user: User
): Promise<GeneratedReport | null> {
  try {
    const template = DEFAULT_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      console.error('Template not found:', templateId);
      return null;
    }

    const data: ReportData = {};

    // Generate data for each enabled section
    for (const section of template.sections) {
      if (!section.enabled) continue;

      switch (section.type) {
        case 'metrics':
          data.metrics = await fetchMetricsData(user);
          break;
        case 'pipeline':
          data.pipeline = await fetchPipelineData(user);
          break;
        case 'activities':
          data.recentActivities = await fetchRecentActivities(user);
          break;
        case 'deals':
          data.topDeals = await fetchTopDeals(user);
          break;
        case 'contacts':
          data.contactStats = await fetchContactStats(user);
          break;
        case 'chart':
          // Charts would be generated from metrics data
          break;
      }
    }

    return {
      template,
      data,
      generatedAt: new Date(),
      user,
    };
  } catch (error) {
    console.error('Error generating report:', error);
    return null;
  }
}

async function fetchMetricsData(user: User) {
  const metrics = await fetchRealMetrics(user);
  return {
    leads: metrics.leads,
    opportunities: metrics.opportunities,
    revenue: metrics.revenue,
    conversion: metrics.conversion,
  };
}

async function fetchPipelineData(user: User) {
  try {
    const params: Record<string, unknown> = {
      location_id: user.location_id,
      limit: 100,
    };

    if (user.role === 'broker' && user.user_id) {
      params.assignedTo = user.user_id;
    }

    const response = await callMCPTool('opportunities_search-opportunity', params);

    if (!response || typeof response !== 'object') {
      return [];
    }

    const opportunities = Array.isArray(response)
      ? response
      : 'opportunities' in response && Array.isArray(response.opportunities)
      ? response.opportunities
      : [];

    // Group by pipeline stage
    const stageMap = new Map<string, { count: number; value: number }>();

    opportunities.forEach((opp: any) => {
      const stage = opp.pipelineStageId || opp.pipeline_stage_id || 'unknown';
      const stageName = opp.stageName || opp.stage_name || 'Sin Etapa';
      const value = parseFloat(opp.monetaryValue || opp.monetary_value || '0');

      if (!stageMap.has(stageName)) {
        stageMap.set(stageName, { count: 0, value: 0 });
      }

      const stageData = stageMap.get(stageName)!;
      stageData.count++;
      stageData.value += value;
    });

    return Array.from(stageMap.entries()).map(([stageName, data]) => ({
      stageName,
      count: data.count,
      value: data.value,
    }));
  } catch (error) {
    console.error('Error fetching pipeline data:', error);
    return [];
  }
}

async function fetchRecentActivities(user: User) {
  // In a real implementation, this would fetch from tasks/notes API
  // For now, return mock data structure
  return [
    {
      type: 'call',
      description: 'Llamada con cliente potencial',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      type: 'email',
      description: 'Email de seguimiento enviado',
      date: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      type: 'meeting',
      description: 'Reunión de cierre agendada',
      date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
  ];
}

async function fetchTopDeals(user: User) {
  try {
    const params: Record<string, unknown> = {
      location_id: user.location_id,
      limit: 10,
    };

    if (user.role === 'broker' && user.user_id) {
      params.assignedTo = user.user_id;
    }

    const response = await callMCPTool('opportunities_search-opportunity', params);

    if (!response || typeof response !== 'object') {
      return [];
    }

    const opportunities = Array.isArray(response)
      ? response
      : 'opportunities' in response && Array.isArray(response.opportunities)
      ? response.opportunities
      : [];

    // Sort by value and take top 5
    return opportunities
      .map((opp: any) => ({
        id: opp.id || opp.opportunity_id || '',
        name: opp.name || opp.opportunity_name || 'Sin nombre',
        value: parseFloat(opp.monetaryValue || opp.monetary_value || '0'),
        stage: opp.stageName || opp.stage_name || 'Sin Etapa',
        probability: Math.floor(Math.random() * 40) + 60, // Mock probability
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  } catch (error) {
    console.error('Error fetching top deals:', error);
    return [];
  }
}

async function fetchContactStats(user: User) {
  try {
    const params: Record<string, unknown> = {
      locationId: user.location_id,
      limit: 1000,
    };

    const response = await callMCPTool('contacts_get-contacts', params);

    if (!response || typeof response !== 'object') {
      return { total: 0, active: 0, newThisWeek: 0 };
    }

    const contacts = 'contacts' in response && Array.isArray(response.contacts)
      ? response.contacts
      : [];

    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const newThisWeek = contacts.filter((contact: any) => {
      const createdAt = contact.dateAdded || contact.date_added || contact.createdAt;
      return createdAt && new Date(createdAt).getTime() > oneWeekAgo;
    }).length;

    return {
      total: contacts.length,
      active: contacts.length, // In real app, would filter by activity
      newThisWeek,
    };
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    return { total: 0, active: 0, newThisWeek: 0 };
  }
}

// ==================== REPORT SCHEDULING ====================

export function getScheduledReports(userId: string): ScheduledReport[] {
  return scheduledReportsStore.get(userId) || [];
}

export function addScheduledReport(userId: string, report: Omit<ScheduledReport, 'id' | 'nextScheduled'>): ScheduledReport {
  const reports = scheduledReportsStore.get(userId) || [];

  const newReport: ScheduledReport = {
    ...report,
    id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    nextScheduled: calculateNextScheduled(report.frequency, report.time, report.dayOfWeek, report.dayOfMonth),
  };

  reports.push(newReport);
  scheduledReportsStore.set(userId, reports);

  return newReport;
}

export function updateScheduledReport(userId: string, reportId: string, updates: Partial<ScheduledReport>): boolean {
  const reports = scheduledReportsStore.get(userId) || [];
  const index = reports.findIndex(r => r.id === reportId);

  if (index === -1) return false;

  reports[index] = { ...reports[index], ...updates };

  // Recalculate next scheduled time if frequency or time changed
  if (updates.frequency || updates.time || updates.dayOfWeek !== undefined || updates.dayOfMonth !== undefined) {
    const report = reports[index];
    report.nextScheduled = calculateNextScheduled(
      report.frequency,
      report.time,
      report.dayOfWeek,
      report.dayOfMonth
    );
  }

  scheduledReportsStore.set(userId, reports);
  return true;
}

export function deleteScheduledReport(userId: string, reportId: string): boolean {
  const reports = scheduledReportsStore.get(userId) || [];
  const filtered = reports.filter(r => r.id !== reportId);

  if (filtered.length === reports.length) return false;

  scheduledReportsStore.set(userId, filtered);
  return true;
}

function calculateNextScheduled(
  frequency: 'daily' | 'weekly' | 'monthly',
  time: string,
  dayOfWeek?: number,
  dayOfMonth?: number
): Date {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);

  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);

  switch (frequency) {
    case 'daily':
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
      break;

    case 'weekly':
      if (dayOfWeek !== undefined) {
        const daysUntilTarget = (dayOfWeek - next.getDay() + 7) % 7;
        next.setDate(next.getDate() + daysUntilTarget);
        if (next <= now) {
          next.setDate(next.getDate() + 7);
        }
      }
      break;

    case 'monthly':
      if (dayOfMonth !== undefined) {
        next.setDate(dayOfMonth);
        if (next <= now) {
          next.setMonth(next.getMonth() + 1);
        }
      }
      break;
  }

  return next;
}

// ==================== REPORT HISTORY ====================

export function getReportHistory(userId: string): ReportHistory[] {
  return reportHistoryStore.get(userId) || [];
}

export function addToHistory(userId: string, history: Omit<ReportHistory, 'id'>): ReportHistory {
  const historyList = reportHistoryStore.get(userId) || [];

  const newHistory: ReportHistory = {
    ...history,
    id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };

  historyList.unshift(newHistory); // Add to beginning

  // Keep only last 50 reports
  if (historyList.length > 50) {
    historyList.splice(50);
  }

  reportHistoryStore.set(userId, historyList);

  return newHistory;
}

// ==================== REPORT SENDING ====================

export async function sendReport(
  report: GeneratedReport,
  recipients: string[],
  userId: string
): Promise<boolean> {
  try {
    // In a real implementation, this would:
    // 1. Format the report as HTML/PDF
    // 2. Send via email using SendGrid/AWS SES
    // 3. Store the sent report in history

    console.log('Sending report to:', recipients);
    console.log('Report data:', report);

    // Add to history
    addToHistory(userId, {
      templateName: report.template.name,
      generatedAt: report.generatedAt,
      sentTo: recipients,
      type: 'manual',
      status: 'sent',
    });

    return true;
  } catch (error) {
    console.error('Error sending report:', error);

    // Add failed attempt to history
    addToHistory(userId, {
      templateName: report.template.name,
      generatedAt: report.generatedAt,
      sentTo: recipients,
      type: 'manual',
      status: 'failed',
    });

    return false;
  }
}

// ==================== EXPORT FUNCTIONS ====================

export function exportReportAsHTML(report: GeneratedReport): string {
  const { template, data, generatedAt, user } = report;

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${template.name} - ${generatedAt.toLocaleDateString()}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
        h1 { color: #047857; border-bottom: 3px solid #10b981; padding-bottom: 10px; }
        h2 { color: #065f46; margin-top: 30px; }
        .metric { display: inline-block; margin: 15px 20px; padding: 20px; background: #f0fdf4; border-radius: 8px; }
        .metric-value { font-size: 32px; font-weight: bold; color: #047857; }
        .metric-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #10b981; color: white; padding: 12px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <h1>${template.icon} ${template.name}</h1>
      <p><strong>Generado:</strong> ${generatedAt.toLocaleString('es-MX')}</p>
      <p><strong>Usuario:</strong> ${user.full_name} (${user.role === 'admin' ? 'Administrador' : 'Broker'})</p>
  `;

  if (data.metrics) {
    html += `
      <h2>Métricas</h2>
      <div>
        <div class="metric">
          <div class="metric-value">${data.metrics.leads}</div>
          <div class="metric-label">Leads</div>
        </div>
        <div class="metric">
          <div class="metric-value">${data.metrics.opportunities}</div>
          <div class="metric-label">Oportunidades</div>
        </div>
        <div class="metric">
          <div class="metric-value">$${data.metrics.revenue.toLocaleString()}</div>
          <div class="metric-label">Revenue</div>
        </div>
        <div class="metric">
          <div class="metric-value">${data.metrics.conversion}%</div>
          <div class="metric-label">Conversión</div>
        </div>
      </div>
    `;
  }

  if (data.pipeline && data.pipeline.length > 0) {
    html += `
      <h2>Pipeline por Etapa</h2>
      <table>
        <tr>
          <th>Etapa</th>
          <th>Deals</th>
          <th>Valor Total</th>
        </tr>
    `;
    data.pipeline.forEach(stage => {
      html += `
        <tr>
          <td>${stage.stageName}</td>
          <td>${stage.count}</td>
          <td>$${stage.value.toLocaleString()}</td>
        </tr>
      `;
    });
    html += `</table>`;
  }

  if (data.topDeals && data.topDeals.length > 0) {
    html += `
      <h2>Top Deals</h2>
      <table>
        <tr>
          <th>Deal</th>
          <th>Etapa</th>
          <th>Valor</th>
          <th>Probabilidad</th>
        </tr>
    `;
    data.topDeals.forEach(deal => {
      html += `
        <tr>
          <td>${deal.name}</td>
          <td>${deal.stage}</td>
          <td>$${deal.value.toLocaleString()}</td>
          <td>${deal.probability}%</td>
        </tr>
      `;
    });
    html += `</table>`;
  }

  if (data.contactStats) {
    html += `
      <h2>Estadísticas de Contactos</h2>
      <div>
        <div class="metric">
          <div class="metric-value">${data.contactStats.total}</div>
          <div class="metric-label">Total Contactos</div>
        </div>
        <div class="metric">
          <div class="metric-value">${data.contactStats.active}</div>
          <div class="metric-label">Activos</div>
        </div>
        <div class="metric">
          <div class="metric-value">${data.contactStats.newThisWeek}</div>
          <div class="metric-label">Nuevos esta semana</div>
        </div>
      </div>
    `;
  }

  html += `
      <div class="footer">
        <p>Selvadentro Tulum - Dashboard IA</p>
        <p>Este reporte fue generado automáticamente. Para más información, accede al dashboard.</p>
      </div>
    </body>
    </html>
  `;

  return html;
}

export function downloadReport(report: GeneratedReport, format: 'html' | 'json' = 'html'): void {
  let content: string;
  let mimeType: string;
  let extension: string;

  if (format === 'html') {
    content = exportReportAsHTML(report);
    mimeType = 'text/html';
    extension = 'html';
  } else {
    content = JSON.stringify(report, null, 2);
    mimeType = 'application/json';
    extension = 'json';
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${report.template.id}-${report.generatedAt.toISOString().split('T')[0]}.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
