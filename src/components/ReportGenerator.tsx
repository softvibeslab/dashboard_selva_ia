import { useState } from 'react';
import { FileText, Download, Mail, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { User } from '../lib/supabase';
import {
  DEFAULT_TEMPLATES,
  generateReport,
  downloadReport,
  sendReport,
  type GeneratedReport,
  type ReportTemplate,
} from '../lib/reports-service';

interface ReportGeneratorProps {
  user: User;
}

export function ReportGenerator({ user }: ReportGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(DEFAULT_TEMPLATES[0]);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [emailRecipients, setEmailRecipients] = useState<string>(user.email || '');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSendStatus('idle');

    try {
      const report = await generateReport(selectedTemplate.id, user);
      setGeneratedReport(report);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (format: 'html' | 'json') => {
    if (!generatedReport) return;
    downloadReport(generatedReport, format);
  };

  const handleSendEmail = async () => {
    if (!generatedReport) return;

    const recipients = emailRecipients
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (recipients.length === 0) {
      alert('Por favor ingresa al menos un email');
      return;
    }

    setIsSending(true);
    setSendStatus('idle');

    try {
      const success = await sendReport(generatedReport, recipients, user.id);
      setSendStatus(success ? 'success' : 'error');
    } catch (error) {
      console.error('Error sending report:', error);
      setSendStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div>
        <h3 className="text-lg font-semibold text-stone-50 mb-4">Selecciona un Template</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEFAULT_TEMPLATES.map((template) => {
            const isSelected = selectedTemplate.id === template.id;

            return (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-purple-500/50 bg-purple-600/10'
                    : 'border-stone-700/50 bg-stone-800/20 hover:border-stone-600/50 hover:bg-stone-800/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{template.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-stone-50 mb-1">{template.name}</h4>
                    <p className="text-sm text-stone-400 mb-2">{template.description}</p>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span className="px-2 py-1 bg-stone-700/30 rounded">
                        {template.sections.length} secciones
                      </span>
                      <span className="px-2 py-1 bg-stone-700/30 rounded capitalize">
                        {template.type}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Template Details */}
      {selectedTemplate && (
        <div className="p-4 bg-stone-800/30 rounded-xl border border-stone-700/30">
          <h4 className="font-semibold text-stone-50 mb-3">Secciones incluidas:</h4>
          <div className="grid grid-cols-2 gap-2">
            {selectedTemplate.sections.map((section) => (
              <div
                key={section.id}
                className="flex items-center gap-2 text-sm text-stone-300"
              >
                <CheckCircle className="w-4 h-4 text-green-400" />
                {section.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Button */}
      <div className="flex gap-3">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              Generar Reporte
            </>
          )}
        </button>
      </div>

      {/* Generated Report Preview */}
      {generatedReport && (
        <div className="space-y-4 pt-6 border-t border-stone-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-stone-50">
              Reporte Generado ✓
            </h3>
            <span className="text-sm text-stone-400">
              {generatedReport.generatedAt.toLocaleString('es-MX')}
            </span>
          </div>

          {/* Report Data Preview */}
          <div className="bg-stone-800/30 rounded-xl p-6 space-y-6">
            {/* Metrics */}
            {generatedReport.data.metrics && (
              <div>
                <h4 className="font-semibold text-stone-50 mb-3">Métricas</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-emerald-600/10 rounded-lg border border-emerald-500/20">
                    <div className="text-2xl font-bold text-emerald-400">
                      {generatedReport.data.metrics.leads}
                    </div>
                    <div className="text-sm text-stone-400">Leads</div>
                  </div>
                  <div className="p-4 bg-blue-600/10 rounded-lg border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-400">
                      {generatedReport.data.metrics.opportunities}
                    </div>
                    <div className="text-sm text-stone-400">Oportunidades</div>
                  </div>
                  <div className="p-4 bg-purple-600/10 rounded-lg border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-400">
                      ${generatedReport.data.metrics.revenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-stone-400">Revenue</div>
                  </div>
                  <div className="p-4 bg-amber-600/10 rounded-lg border border-amber-500/20">
                    <div className="text-2xl font-bold text-amber-400">
                      {generatedReport.data.metrics.conversion}%
                    </div>
                    <div className="text-sm text-stone-400">Conversión</div>
                  </div>
                </div>
              </div>
            )}

            {/* Pipeline */}
            {generatedReport.data.pipeline && generatedReport.data.pipeline.length > 0 && (
              <div>
                <h4 className="font-semibold text-stone-50 mb-3">Pipeline</h4>
                <div className="space-y-2">
                  {generatedReport.data.pipeline.map((stage, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-stone-800/50 rounded-lg"
                    >
                      <span className="text-stone-300">{stage.stageName}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-stone-400">{stage.count} deals</span>
                        <span className="font-semibold text-emerald-400">
                          ${stage.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Deals */}
            {generatedReport.data.topDeals && generatedReport.data.topDeals.length > 0 && (
              <div>
                <h4 className="font-semibold text-stone-50 mb-3">Top Deals</h4>
                <div className="space-y-2">
                  {generatedReport.data.topDeals.slice(0, 3).map((deal, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-stone-800/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-stone-200">{deal.name}</div>
                        <div className="text-sm text-stone-400">{deal.stage}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-emerald-400">
                          ${deal.value.toLocaleString()}
                        </div>
                        <div className="text-sm text-stone-400">{deal.probability}% prob</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Stats */}
            {generatedReport.data.contactStats && (
              <div>
                <h4 className="font-semibold text-stone-50 mb-3">Contactos</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-stone-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-stone-200">
                      {generatedReport.data.contactStats.total}
                    </div>
                    <div className="text-sm text-stone-400">Total</div>
                  </div>
                  <div className="p-4 bg-stone-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-400">
                      {generatedReport.data.contactStats.active}
                    </div>
                    <div className="text-sm text-stone-400">Activos</div>
                  </div>
                  <div className="p-4 bg-stone-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">
                      {generatedReport.data.contactStats.newThisWeek}
                    </div>
                    <div className="text-sm text-stone-400">Nuevos</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {/* Download Options */}
            <div>
              <h4 className="font-semibold text-stone-50 mb-3">Descargar</h4>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload('html')}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  Descargar HTML
                </button>
                <button
                  onClick={() => handleDownload('json')}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  Descargar JSON
                </button>
              </div>
            </div>

            {/* Email Options */}
            <div>
              <h4 className="font-semibold text-stone-50 mb-3">Enviar por Email</h4>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  placeholder="email1@example.com, email2@example.com"
                  className="flex-1 px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleSendEmail}
                  disabled={isSending}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Enviar
                    </>
                  )}
                </button>
              </div>

              {/* Send Status */}
              {sendStatus !== 'idle' && (
                <div
                  className={`mt-3 flex items-center gap-2 p-3 rounded-lg ${
                    sendStatus === 'success'
                      ? 'bg-emerald-600/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-red-600/10 border border-red-500/30 text-red-400'
                  }`}
                >
                  {sendStatus === 'success' ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Reporte enviado exitosamente</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span>Error al enviar el reporte</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
