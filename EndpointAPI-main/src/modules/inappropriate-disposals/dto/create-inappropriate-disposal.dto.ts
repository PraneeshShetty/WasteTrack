import { IsString, IsNumber, IsOptional, IsArray, IsEnum } from 'class-validator';
import { GarbageType } from '../../utils/schemas/garbage-type.enum';

export class CreateInappropriateDisposalDto {
    @IsEnum(GarbageType)
    wasteType: GarbageType;

    @IsString()
    address: string;

    @IsNumber()
    latitude: number;

    @IsNumber()
    longitude: number;

    @IsArray()
    @IsString({ each: true })
    images: string[];

    @IsString()
    @IsOptional()
    notes?: string;

    @IsString()
    @IsOptional()
    reportedBy?: string;
}
