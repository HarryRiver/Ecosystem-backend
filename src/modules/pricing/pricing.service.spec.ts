import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Service } from '../services/entities/service.entity';
import { ServiceVariant } from '../service_variants/entities/service_variant.entity';
import { PricingService } from './pricing.service';

describe('PricingService', () => {
  let service: PricingService;

  const serviceRepository = {
    find: jest.fn(),
  };

  const serviceVariantRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        {
          provide: getRepositoryToken(Service),
          useValue: serviceRepository,
        },
        {
          provide: getRepositoryToken(ServiceVariant),
          useValue: serviceVariantRepository,
        },
      ],
    }).compile();

    service = module.get<PricingService>(PricingService);
  });

  it('calculates totals for fixed-price items', async () => {
    serviceRepository.find.mockResolvedValue([
      {
        id: 1,
        code: 'SOFA_SINGLE',
        name: 'Sofa don',
        pricing_type: 'fixed',
        default_unit: 'item',
        base_price: 150000,
        manual_quote_required: false,
        requires_custom_name: false,
        active: true,
      },
    ]);
    serviceVariantRepository.find.mockResolvedValue([]);

    const result = await service.quote({
      items: [{ service_id: '1', quantity: 2 }],
      handling_mode: 'inside' as any,
    });

    expect(result.service_subtotal).toBe(300000);
    expect(result.handling_fee).toBe(0);
    expect(result.estimated_total).toBe(300000);
    expect(result.manual_quote_required).toBe(false);
  });

  it('marks quote-only items as manual quote required', async () => {
    serviceRepository.find.mockResolvedValue([
      {
        id: 2,
        code: 'CUSTOM',
        name: 'Hang muc khac',
        pricing_type: 'quote_only',
        default_unit: 'item',
        base_price: null,
        manual_quote_required: true,
        requires_custom_name: true,
        active: true,
      },
    ]);
    serviceVariantRepository.find.mockResolvedValue([]);

    const result = await service.quote({
      items: [{ service_id: '2', custom_item_name: 'May loc nuoc cu' }],
      handling_mode: 'inside' as any,
    });

    expect(result.manual_quote_required).toBe(true);
    expect(result.pricing_label).toBe('Cần báo giá');
  });
});
