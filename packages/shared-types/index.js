/**
 * @typedef {'room_service' | 'dine_in' | 'pickup' | 'walk_in'} ServiceType
 */

/**
 * @typedef {'new' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled'} OrderStatus
 */

/**
 * @typedef {'receptionist' | 'owner'} StaffRole
 */

/**
 * @typedef {Object} MenuItem
 * @property {string} id
 * @property {string} restaurant_id
 * @property {string} section
 * @property {string} name
 * @property {number} price
 * @property {boolean} veg
 * @property {boolean} available
 * @property {number} sort_order
 */

/**
 * @typedef {Object} CartLineItem
 * @property {string} id
 * @property {string} name
 * @property {number} qty
 * @property {number} price
 */

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} restaurant_id
 * @property {ServiceType} service_type
 * @property {string|null} room_number
 * @property {string|null} table_number
 * @property {string} guest_name
 * @property {string} guest_phone
 * @property {string|null} note
 * @property {CartLineItem[]} items
 * @property {number} total
 * @property {number} [tax_amount]
 * @property {number} [grand_total]
 * @property {string} [payment_status]
 * @property {OrderStatus} status
 * @property {string} created_at
 */

/**
 * @typedef {Object} StaffMember
 * @property {string} id
 * @property {string} restaurant_id
 * @property {string} name
 * @property {StaffRole} role
 * @property {boolean} active
 */

export { getRuntimeEnv, getPortalUrls, PORTAL_DEFAULTS } from './runtimeConfig.js';

export const SERVICE_TYPES = /** @type {const} */ ([
  'room_service',
  'dine_in',
  'pickup',
  'walk_in',
]);

export const ORDER_STATUSES = /** @type {const} */ ([
  'new',
  'confirmed',
  'preparing',
  'ready',
  'served',
  'cancelled',
]);

export const SERVICE_LABELS = {
  room_service: 'Room Service',
  dine_in: 'Dine In (Table)',
  pickup: 'Pick Up / Takeaway',
  walk_in: 'Walk-In Dining',
};

export const STATUS_LABELS = {
  new: 'New',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Served',
  cancelled: 'Cancelled',
};
