/**
 * A Destination is one TFN (toll-free number) owned by a buyer.
 *
 * A single buyer can have many destinations — e.g. one per product line
 * ("Tier-1 ACA" vs "Tier-1 Medicare") or one per shift. Each destination
 * carries its OWN concurrency cap and daily/monthly caps; CC and Cap are
 * never campaign-level in the Ringba data model. The router picks a
 * destination based on the campaign's buyers and their destinations' caps.
 */

export interface Destination {
  id: string;
  buyerId: string;
  /** The toll-free number that calls are actually dialed to. */
  tfn: string;
  /** Friendly label, e.g. "Tier-1 ACA Inbound". */
  name: string;
  /** Max simultaneous live calls allowed on this destination. */
  concurrencyCap: number;
  /** Max calls per day. 0 = unlimited. */
  dailyCap: number;
  /** Max calls per month. 0 = unlimited. */
  monthlyCap: number;
  /** When false, the router skips this destination. */
  enabled: boolean;
}
