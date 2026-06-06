import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
  ) {}

  async create(createReviewDto: CreateReviewDto) {
    const review = this.reviewsRepository.create({
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
      reviewer_name: createReviewDto.reviewer_name,
      reviewer_email: createReviewDto.reviewer_email,
      user: createReviewDto.user_id
        ? { id: createReviewDto.user_id }
        : undefined,
    });
    return await this.reviewsRepository.save(review);
  }

  findAll() {
    return this.reviewsRepository.find({ order: { created_at: 'DESC' } });
  }

  findOne(id: number) {
    return this.reviewsRepository.findOne({ where: { id } });
  }

  async update(id: number, updateReviewDto: UpdateReviewDto) {
    const { user_id, ...rest } = updateReviewDto as any;
    const updateData: any = { ...rest };
    if (user_id !== undefined) {
      updateData.user = user_id ? { id: user_id } : null;
    }
    await this.reviewsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number) {
    return await this.reviewsRepository.delete(id);
  }
}
