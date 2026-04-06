import { PartialType } from '@nestjs/mapped-types';
import { CreateVouncherDto } from './create-vouncher.dto';

export class UpdateVouncherDto extends PartialType(CreateVouncherDto) {}
