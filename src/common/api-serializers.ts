type AnyRecord = Record<string, any>;

function toStringId(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toIsoString(value: unknown): string {
  if (!value) {
    return new Date(0).toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const parsed = new Date(String(value));
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  return String(value);
}

function normalizeRoleName(value: unknown): 'admin' | 'customer' {
  const role = String(value ?? '').trim().toLowerCase();
  return role === 'admin' ? 'admin' : 'customer';
}

function normalizeOrderStatus(value: unknown):
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'delivering'
  | 'completed'
  | 'cancelled'
  | 'no_show' {
  const status = String(value ?? '').trim().toLowerCase();

  if (status === 'awaiting_payment' || status === 'pending_confirmation') {
    return 'pending';
  }

  if (
    status === 'draft' ||
    status === 'confirmed' ||
    status === 'delivering' ||
    status === 'completed' ||
    status === 'cancelled' ||
    status === 'no_show'
  ) {
    return status;
  }

  return 'pending';
}

function normalizePricingType(value: unknown):
  | 'fixed'
  | 'per_kg'
  | 'per_unit'
  | 'quote' {
  const pricingType = String(value ?? '').trim().toLowerCase();

  if (pricingType === 'weight_based') {
    return 'per_kg';
  }

  if (pricingType === 'quote_only') {
    return 'quote';
  }

  if (pricingType === 'fixed') {
    return 'fixed';
  }

  return 'per_unit';
}

export function serializeUser(user: AnyRecord | null | undefined) {
  if (!user) {
    return null;
  }

  const roles = Array.isArray(user.roleSet) ? user.roleSet : [];
  const primaryRole = roles[0]?.name ?? 'customer';

  return {
    id: toStringId(user.id),
    full_name: user.full_name ?? '',
    phone: user.phone ?? '',
    email: user.email ?? '',
    address: user.address ?? '',
    city: user.city ?? '',
    district: user.district ?? '',
    role: normalizeRoleName(primaryRole),
    prepaid_required: Boolean(user.prepaid_required),
    is_blacklisted: Boolean(user.is_blacklisted),
    no_show_count: toNumber(user.no_show_count),
    status: user.status ?? 'active',
    created_at: toIsoString(user.created_at),
    updated_at: toIsoString(user.updated_at),
  };
}

export function serializeServiceVariant(variant: AnyRecord | null | undefined) {
  if (!variant) {
    return null;
  }

  return {
    id: toStringId(variant.id),
    service_id: toStringId(variant.service?.id),
    label: variant.label ?? '',
    price: toNumber(variant.price),
    unit: variant.unit ?? 'item',
    active: Boolean(variant.active),
  };
}

export function serializeService(service: AnyRecord | null | undefined) {
  if (!service) {
    return null;
  }

  const variants = Array.isArray(service.variants) ? service.variants : [];

  return {
    id: toStringId(service.id),
    code: service.code ?? '',
    name: service.name ?? '',
    category: service.category ?? 'other',
    pricing_type: normalizePricingType(service.pricing_type),
    base_price: toNumber(service.base_price),
    default_unit: service.default_unit ?? 'item',
    active: Boolean(service.active),
    variants: variants
      .map((variant) => serializeServiceVariant(variant))
      .filter(Boolean),
  };
}

export function serializeTimeSlot(
  slot: AnyRecord | null | undefined,
  options?: { isFull?: boolean },
) {
  if (!slot) {
    return null;
  }

  return {
    id: toStringId(slot.id),
    start_time: slot.start_time ?? '',
    end_time: slot.end_time ?? '',
    max_orders: toNumber(slot.max_orders),
    active: Boolean(slot.active),
    ...(typeof options?.isFull === 'boolean' ? { is_full: options.isFull } : {}),
  };
}

export function serializeOrder(order: AnyRecord | null | undefined) {
  if (!order) {
    return null;
  }

  const items = Array.isArray(order.order_items) ? order.order_items : [];
  const timelineStatus = normalizeOrderStatus(order.status);

  return {
    id: toStringId(order.id),
    code: order.order_code ?? '',
    status: timelineStatus,
    customer: {
      name: order.customer_name ?? order.customer?.full_name ?? '',
      phone: order.customer_phone ?? order.customer?.phone ?? '',
      email: order.customer_email ?? order.customer?.email ?? '',
    },
    address: {
      street: order.pickup_address ?? '',
      ward: '',
      district: '',
      province: '',
    },
    booking_date: order.booking_date ?? '',
    time_slot_id: toStringId(order.time_slot?.id),
    time_slot_label: order.time_slot?.label ?? undefined,
    items: items.map((item: AnyRecord) => ({
      id: toStringId(item.id),
      service_name: item.service_name_snapshot ?? '',
      variant_label: item.variant_label_snapshot ?? undefined,
      quantity: toNumber(item.quantity),
      unit_price: toNumber(item.unit_price),
      line_total: toNumber(item.line_total),
      custom_item_name: item.custom_item_name ?? undefined,
    })),
    handling_mode: order.handling_mode ?? 'inside',
    stairs_floors:
      order.stairs_floors === null || order.stairs_floors === undefined
        ? undefined
        : toNumber(order.stairs_floors),
    voucher_code: order.voucher?.code ?? undefined,
    service_subtotal: toNumber(order.service_subtotal),
    handling_fee: toNumber(order.handling_fee),
    discount_amount: toNumber(order.discount_amount),
    estimated_total: toNumber(order.estimated_total),
    final_total:
      order.final_total === null || order.final_total === undefined
        ? null
        : toNumber(order.final_total),
    payment_method: order.payment_method ?? 'cash',
    cash_policy_accepted: Boolean(order.cash_policy_accepted),
    internal_notes: order.notes ?? undefined,
    assigned_staff: undefined,
    adjustment_reason: order.adjustment_reason ?? undefined,
    manual_quote_required: Boolean(order.manual_quote_required),
    timeline: [
      {
        status: timelineStatus,
        created_at: toIsoString(order.updated_at ?? order.created_at),
      },
    ],
    created_at: toIsoString(order.created_at),
    updated_at: toIsoString(order.updated_at),
  };
}

export function serializePayment(payment: AnyRecord | null | undefined) {
  if (!payment) {
    return null;
  }

  return {
    id: toStringId(payment.id),
    order_id: toStringId(payment.order?.id),
    order_code: payment.order?.order_code ?? '',
    method: payment.method ?? 'cash',
    status: payment.status ?? 'pending',
    amount: toNumber(payment.amount),
    provider_ref: payment.provider_ref ?? undefined,
    created_at: toIsoString(payment.created_at),
  };
}

export function serializeVoucher(voucher: AnyRecord | null | undefined) {
  if (!voucher) {
    return null;
  }

  return {
    id: toStringId(voucher.id),
    code: voucher.code ?? '',
    type: voucher.type ?? 'fixed',
    value: toNumber(voucher.value),
    max_discount:
      voucher.max_discount === null || voucher.max_discount === undefined
        ? undefined
        : toNumber(voucher.max_discount),
    min_order_value: toNumber(voucher.min_order_value),
    usage_limit: toNumber(voucher.usage_limit),
    used_count: toNumber(voucher.used_count),
    start_date: voucher.start_date ? toIsoString(voucher.start_date) : '',
    end_date: voucher.end_date ? toIsoString(voucher.end_date) : '',
    active: Boolean(voucher.active),
  };
}

export function paginate<T>(
  items: T[],
  page = 1,
  limit = items.length > 0 ? items.length : 10,
) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Number(limit) || 10);
  const total = items.length;
  const start = (safePage - 1) * safeLimit;
  const pagedItems = items.slice(start, start + safeLimit);

  return {
    items: pagedItems,
    total,
    page: safePage,
    limit: safeLimit,
    total_pages: Math.max(1, Math.ceil(total / safeLimit)),
  };
}
