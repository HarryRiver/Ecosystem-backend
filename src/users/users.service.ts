import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersFilterDto } from './dto/get-users-filter.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ===================== CURRENT USER =====================
  async me(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roleSet'],
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password, refreshToken, ...result } = user;
    return result;
  }

  // ===================== UPDATE PROFILE =====================
  async updateProfile(userId: number, updateData: UpdateUserDto): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (updateData.full_name !== undefined) {
      user.full_name = updateData.full_name;
    }
    if (updateData.phone !== undefined) {
      user.phone = updateData.phone;
    }
    const saved = await this.userRepository.save(user);
    return `Update profile ${saved.id} successfully`;
  }

  // ===================== ADMIN: FIND ALL =====================
  async adminFindAll(filter: GetUsersFilterDto) {
    const { search, status, role } = filter;
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roleSet', 'roleSet');

    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('user.full_name ILIKE :search', { search: `%${search}%` })
            .orWhere('user.phone ILIKE :search', { search: `%${search}%` })
            .orWhere('user.email ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    if (status) {
      query.andWhere('user.status = :status', { status });
    }

    if (role) {
      query.andWhere('roleSet.name = :role', { role });
    }

    query.orderBy('user.created_at', 'DESC');
    return await query.getMany();
  }

  // ===================== ADMIN: FIND ONE =====================
  async adminFindOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roleSet', 'orders'],
    });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    const { password, refreshToken, ...result } = user;
    
    // Identify account type: registered vs guest
    // Usually guest has empty password or specific role
    return {
      ...result,
      account_type: user.password && user.password.length > 0 ? 'registered' : 'guest',
    };
  }

  // ===================== ADMIN: UPDATE USER =====================
  async adminUpdateUser(id: number, dto: AdminUpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    this.userRepository.merge(user, dto);
    return await this.userRepository.save(user);
  }

  // ===================== ADMIN: TOGGLE LOCK =====================
  async adminToggleLock(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    user.status = user.status === 'locked' ? 'active' : 'locked';
    return await this.userRepository.save(user);
  }

  // ===================== ADMIN: TOGGLE PREPAID =====================
  async adminTogglePrepaid(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    user.prepaid_required = !user.prepaid_required;
    return await this.userRepository.save(user);
  }

  // ===================== ADMIN: TOGGLE BLACKLIST =====================
  async adminToggleBlacklist(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    user.is_blacklisted = !user.is_blacklisted;
    return await this.userRepository.save(user);
  }
}
