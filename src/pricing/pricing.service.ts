import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Service } from '../services/entities/service.entity';
import { ServiceVariant } from '../service_variants/entities/service_variant.entity';
import { CreateQuoteDto, HandlingMode } from './dto/create-quote.dto';
import { QuoteItemDto } from './dto/quote-item.dto';

type PricedQuoteItem = {
  service_id: number | string;
  service_variant_id: number | string | null;
  service_code_snapshot: string;
  service_name_snapshot: string;
  variant_code_snapshot: string | null;
  variant_label_snapshot: string | null;
  pricing_type: string;
  unit: string;
  quantity: number;
  measurement_value: number | null;
  unit_price: number | null;
  line_total: number | null;
  custom_item_name: string | null;
  custom_item_note: string | null;
  manual_quote_required: boolean;
};

export type QuoteResult = {
  items: PricedQuoteItem[];
  service_subtotal: number;
  handling_fee: number;
  estimated_total: number;
  manual_quote_required: boolean;
  pricing_label: string;
};

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceVariant)
    private readonly serviceVariantRepository: Repository<ServiceVariant>,
  ) {}

  async quote(createQuoteDto: CreateQuoteDto): Promise<QuoteResult> {
    const { items, handling_mode, stairs_floors } = createQuoteDto;

    const serviceIdentifiers = [...new Set(items.map((item) => item.service_id))];
    const variantIdentifiers = [
      ...new Set(
        items
          .map((item) => item.service_variant_id)
          .filter((value): value is string => Boolean(value)),
      ),
    ];

    const serviceIds = serviceIdentifiers
      .map((value) => this.toNumericId(value))
      .filter((value): value is number => value !== null);
    const serviceCodes = serviceIdentifiers
      .map((value) => this.toCode(value))
      .filter((value): value is string => value !== null);

    const variantIds = variantIdentifiers
      .map((value) => this.toNumericId(value))
      .filter((value): value is number => value !== null);
    const variantCodes = variantIdentifiers
      .map((value) => this.toCode(value))
      .filter((value): value is string => value !== null);

    const services = serviceIdentifiers.length
      ? await this.serviceRepository.find({
          where: [
            ...(serviceIds.length ? [{ id: In(serviceIds), active: true }] : []),
            ...(serviceCodes.length
              ? [{ code: In(serviceCodes), active: true }]
              : []),
          ],
        })
      : [];
    const variants = variantIdentifiers.length
      ? await this.serviceVariantRepository.find({
          where: [
            ...(variantIds.length ? [{ id: In(variantIds), active: true }] : []),
            ...(variantCodes.length
              ? [{ code: In(variantCodes), active: true }]
              : []),
          ],
          relations: ['service'],
        })
      : [];

    const serviceMap = new Map<string, Service>();
    services.forEach((service) => {
      serviceMap.set(String(service.id), service);
      serviceMap.set(service.code, service);
    });
    const variantMap = new Map<string, ServiceVariant>();
    variants.forEach((variant) => {
      variantMap.set(String(variant.id), variant);
      variantMap.set(variant.code, variant);
    });

    const pricedItems = items.map((item) =>
      this.priceItem(item, serviceMap, variantMap),
    );

    const serviceSubtotal = this.roundMoney(
      pricedItems.reduce((sum, item) => sum + (item.line_total ?? 0), 0),
    );
    const handlingFee = this.calculateHandlingFee(handling_mode, stairs_floors);
    const estimatedTotal = this.roundMoney(
      Math.max(0, serviceSubtotal + handlingFee),
    );
    const manualQuoteRequired = pricedItems.some(
      (item) => item.manual_quote_required,
    );

    return {
      items: pricedItems,
      service_subtotal: serviceSubtotal,
      handling_fee: handlingFee,
      estimated_total: estimatedTotal,
      manual_quote_required: manualQuoteRequired,
      pricing_label: this.buildPricingLabel(
        estimatedTotal,
        manualQuoteRequired,
        serviceSubtotal,
      ),
    };
  }

  private priceItem(
    item: QuoteItemDto,
    serviceMap: Map<string, Service>,
    variantMap: Map<string, ServiceVariant>,
  ): PricedQuoteItem {
    const service = serviceMap.get(String(item.service_id));
    if (!service) {
      throw new BadRequestException(
        `Service #${item.service_id} không tồn tại hoặc đang bị tắt`,
      );
    }

    const variant = item.service_variant_id
      ? variantMap.get(String(item.service_variant_id))
      : undefined;

    if (item.service_variant_id && !variant) {
      throw new BadRequestException(
        `Variant #${item.service_variant_id} không tồn tại hoặc đang bị tắt`,
      );
    }

    if (variant && variant.service?.id !== service.id) {
      throw new BadRequestException(
        `Variant #${variant.id} không thuộc service #${service.id}`,
      );
    }

    if (service.requires_custom_name && !item.custom_item_name?.trim()) {
      throw new BadRequestException(
        `Service ${service.name} yêu cầu custom_item_name`,
      );
    }

    const quantity = item.quantity ?? 1;
    const measurementValue = item.measurement_value ?? null;
    const pricingType = service.pricing_type;
    const unit = variant?.unit ?? service.default_unit;
    const unitPrice = this.toNumber(variant?.price ?? service.base_price);
    const manualQuoteRequired =
      service.manual_quote_required || pricingType === 'quote_only';

    if (pricingType === 'fixed' && quantity < 1) {
      throw new BadRequestException(
        `Service ${service.name} yêu cầu quantity phải lớn hơn 0`,
      );
    }

    if (pricingType === 'weight_based') {
      if (measurementValue === null || measurementValue <= 0) {
        throw new BadRequestException(
          `Service ${service.name} yêu cầu measurement_value lớn hơn 0`,
        );
      }
      if (unitPrice === null) {
        throw new BadRequestException(
          `Service ${service.name} chưa có đơn giá để tính theo khối lượng`,
        );
      }
    }

    if (pricingType === 'fixed' && unitPrice === null) {
      throw new BadRequestException(
        `Service ${service.name} chưa có đơn giá để tính`,
      );
    }

    let lineTotal: number | null = null;

    if (pricingType === 'fixed') {
      lineTotal = this.roundMoney(quantity * (unitPrice ?? 0));
    }

    if (pricingType === 'weight_based') {
      lineTotal = this.roundMoney((measurementValue ?? 0) * (unitPrice ?? 0));
    }

    return {
      service_id: service.id,
      service_variant_id: variant?.id ?? null,
      service_code_snapshot: service.code,
      service_name_snapshot: service.name,
      variant_code_snapshot: variant?.code ?? null,
      variant_label_snapshot: variant?.label ?? null,
      pricing_type: pricingType,
      unit,
      quantity,
      measurement_value: measurementValue,
      unit_price: unitPrice,
      line_total: lineTotal,
      custom_item_name: item.custom_item_name?.trim() || null,
      custom_item_note: item.custom_item_note?.trim() || null,
      manual_quote_required: manualQuoteRequired,
    };
  }

  private calculateHandlingFee(
    handlingMode: HandlingMode,
    stairsFloors?: number,
  ): number {
    if (handlingMode === HandlingMode.INSIDE) {
      return 0;
    }

    if (handlingMode === HandlingMode.OUTSIDE) {
      return -30000;
    }

    if (!stairsFloors || stairsFloors < 1) {
      throw new BadRequestException(
        'handling_mode=stairs yêu cầu stairs_floors lớn hơn hoặc bằng 1',
      );
    }

    return 50000 + 30000 * (stairsFloors - 1);
  }

  private buildPricingLabel(
    estimatedTotal: number,
    manualQuoteRequired: boolean,
    serviceSubtotal: number,
  ): string {
    if (manualQuoteRequired && serviceSubtotal <= 0) {
      return 'Cần báo giá';
    }

    if (manualQuoteRequired) {
      return `Từ ${this.formatCurrency(estimatedTotal)}`;
    }

    return this.formatCurrency(estimatedTotal);
  }

  private formatCurrency(value: number): string {
    return `${new Intl.NumberFormat('vi-VN').format(value)} đ`;
  }

  private roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private toNumber(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    return Number(value);
  }

  private toNumericId(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }

  private toCode(value: string | number | null | undefined): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const normalized = String(value).trim();
    return normalized === '' || /^\d+$/.test(normalized) ? null : normalized;
  }
}
