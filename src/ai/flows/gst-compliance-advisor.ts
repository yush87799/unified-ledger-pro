'use server';
/**
 * @fileOverview A Genkit flow for GST compliance and optimization advice.
 *
 * - gstComplianceAdvisor - A function that handles the GST compliance advisory process.
 * - GSTComplianceAdvisorInput - The input type for the gstComplianceAdvisor function.
 * - GSTComplianceAdvisorOutput - The return type for the gstComplianceAdvisor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GSTComplianceFindingSchema = z.object({
  type: z.enum(['error', 'optimization', 'warning']).describe('The type of finding: error, optimization, or warning.'),
  description: z.string().describe('A detailed description of the finding.'),
  suggestedAction: z.string().describe('The suggested action the accountant should take.'),
  transactionIds: z.array(z.string()).describe('An array of transaction IDs related to this finding.'),
});

const GSTComplianceAdvisorInputSchema = z.object({
  transactionDataJson: z
    .string()
    .describe('A JSON string representing the GST transaction data. Each object should at least contain a transactionId, type (e.g., "sale", "purchase"), amount, and GST details.'),
  gstRegulationsSummary: z
    .string()
    .optional()
    .describe('An optional summary of applicable GST regulations or specific rules to consider.'),
});
export type GSTComplianceAdvisorInput = z.infer<typeof GSTComplianceAdvisorInputSchema>;

const GSTComplianceAdvisorOutputSchema = z.object({
  complianceFindings: z.array(GSTComplianceFindingSchema).describe('A list of compliance findings, including errors, warnings, and optimization opportunities.'),
  overallSummary: z.string().describe('An overall summary of the GST compliance status and key takeaways.'),
});
export type GSTComplianceAdvisorOutput = z.infer<typeof GSTComplianceAdvisorOutputSchema>;

export async function gstComplianceAdvisor(input: GSTComplianceAdvisorInput): Promise<GSTComplianceAdvisorOutput> {
  return gstComplianceAdvisorFlow(input);
}

const gstComplianceAdvisorPrompt = ai.definePrompt({
  name: 'gstComplianceAdvisorPrompt',
  input: {schema: GSTComplianceAdvisorInputSchema},
  output: {schema: GSTComplianceAdvisorOutputSchema},
  prompt: `You are an expert GST compliance advisor and auditor. Your task is to analyze provided GST transaction data to identify potential errors, compliance issues, and areas for tax optimization.

Transaction Data (JSON format):
{{{transactionDataJson}}}

{{#if gstRegulationsSummary}}
Applicable GST Regulations Summary:
{{{gstRegulationsSummary}}}

Consider these regulations when analyzing the data.
{{/if}}

Perform the following:
1.  **Identify Errors**: Look for common GST errors such as incorrect GST rates, miscategorized transactions, missing input tax credit opportunities, or discrepancies in calculated vs. actual GST.
2.  **Highlight Optimization Areas**: Point out opportunities to reduce tax liabilities or improve cash flow, such as maximizing input tax credit claims, or identifying benefits from specific schemes.
3.  **Provide Actionable Advice**: For each finding, provide a clear description and a concrete, actionable suggestion for the accountant.
4.  **Summarize**: Provide an overall summary of the compliance status and the most critical findings or opportunities.

Ensure your output strictly adheres to the provided JSON schema for 'complianceFindings' and 'overallSummary'.`,
});

const gstComplianceAdvisorFlow = ai.defineFlow(
  {
    name: 'gstComplianceAdvisorFlow',
    inputSchema: GSTComplianceAdvisorInputSchema,
    outputSchema: GSTComplianceAdvisorOutputSchema,
  },
  async input => {
    const {output} = await gstComplianceAdvisorPrompt(input);
    return output!;
  }
);
