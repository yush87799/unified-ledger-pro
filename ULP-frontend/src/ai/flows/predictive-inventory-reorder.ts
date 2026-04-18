'use server';
/**
 * @fileOverview A Genkit flow for predicting future demand, suggesting optimal reorder quantities and times for inventory.
 *
 * - predictInventoryReorder - A function that handles the inventory reorder prediction process.
 * - PredictiveInventoryReorderInput - The input type for the predictInventoryReorder function.
 * - PredictiveInventoryReorderOutput - The return type for the predictInventoryReorder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictiveInventoryReorderInputSchema = z.object({
  productId: z.string().describe('The ID of the product for which to predict demand and recommend reorders.'),
  historicalSalesData: z.array(z.object({
    date: z.string().describe('Date of the sales record in YYYY-MM-DD format.'),
    quantitySold: z.number().int().min(0).describe('Quantity of the product sold on this date.'),
  })).describe('Array of historical sales data records.'),
  currentStockLevel: z.number().int().min(0).describe('The current quantity of the product in stock.'),
  leadTimeDays: z.number().int().min(0).describe('The number of days it takes for new stock to arrive after an order is placed.'),
  safetyStockDays: z.number().int().min(0).describe('Number of days of safety stock to maintain as a buffer.'),
  forecastPeriodDays: z.number().int().min(1).describe('The number of days for which to predict future demand (e.g., 30 for a month).'),
});
export type PredictiveInventoryReorderInput = z.infer<typeof PredictiveInventoryReorderInputSchema>;

const PredictiveInventoryReorderOutputSchema = z.object({
  predictedDemandForPeriod: z.number().int().min(0).describe('Predicted total demand for the specified forecast period.'),
  reorderQuantity: z.number().int().min(0).describe('The suggested quantity of the product to reorder.'),
  reorderDate: z.string().describe('The suggested date (YYYY-MM-DD) to place the reorder to prevent stockouts.'),
  reasoning: z.string().describe('An explanation for the predicted demand and the reorder recommendations.'),
});
export type PredictiveInventoryReorderOutput = z.infer<typeof PredictiveInventoryReorderOutputSchema>;

export async function predictInventoryReorder(input: PredictiveInventoryReorderInput): Promise<PredictiveInventoryReorderOutput> {
  return predictiveInventoryReorderFlow(input);
}

const predictiveInventoryReorderPrompt = ai.definePrompt({
  name: 'predictiveInventoryReorderPrompt',
  input: {schema: PredictiveInventoryReorderInputSchema.extend({ currentDate: z.string() })},
  output: {schema: PredictiveInventoryReorderOutputSchema},
  prompt: `You are an expert inventory manager and demand forecaster. Your task is to analyze historical sales data and current inventory levels to predict future demand and recommend optimal reorder quantities and timing to minimize stockouts and carrying costs.\n\nHere is the product information:\nProduct ID: {{{productId}}}\nCurrent Stock Level: {{{currentStockLevel}}} units\nSupplier Lead Time: {{{leadTimeDays}}} days\nSafety Stock Buffer: {{{safetyStockDays}}} days of demand\nForecast Period: {{{forecastPeriodDays}}} days\n\nHistorical Sales Data (date, quantitySold):\n{{#each historicalSalesData}}\n- {{this.date}}: {{this.quantitySold}} units\n{{/each}}\n\nBased on this data, please:\n1.  Predict the demand for the next {{{forecastPeriodDays}}} days.\n2.  Calculate the optimal reorder quantity, considering the current stock, predicted demand, lead time demand, and safety stock.\n3.  Suggest the ideal date to place the reorder to avoid stockouts. The reorder date must be a future date relative to today, formatted as YYYY-MM-DD.\n4.  Provide a clear reasoning for your predictions and recommendations.\n\nThe current date is {{currentDate}}. Ensure the reorder date is in the future relative to currentDate.`,
});

const predictiveInventoryReorderFlow = ai.defineFlow(
  {
    name: 'predictiveInventoryReorderFlow',
    inputSchema: PredictiveInventoryReorderInputSchema,
    outputSchema: PredictiveInventoryReorderOutputSchema,
  },
  async (input) => {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const {output} = await predictiveInventoryReorderPrompt({...input, currentDate});
    return output!;
  }
);
