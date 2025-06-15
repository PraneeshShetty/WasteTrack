import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InappropriateDisposal } from './schemas/inappropriate-disposal.schema';
import { CreateInappropriateDisposalDto } from './dto/create-inappropriate-disposal.dto';

@Injectable()
export class InappropriateDisposalsService {
    constructor(
        @InjectModel(InappropriateDisposal.name)
        private readonly inappropriateDisposalModel: Model<InappropriateDisposal>,
    ) {}

    async create(createDto: CreateInappropriateDisposalDto, userId: string): Promise<InappropriateDisposal> {
        const disposal = new this.inappropriateDisposalModel({
            ...createDto,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return disposal.save();
    }

    async findAll(): Promise<InappropriateDisposal[]> {
        return this.inappropriateDisposalModel.find().sort({ createdAt: -1 }).exec();
    }

    async findByUserId(userId: string): Promise<InappropriateDisposal[]> {
        return this.inappropriateDisposalModel.find({ userId }).sort({ createdAt: -1 }).exec();
    }

    async findOne(id: string): Promise<InappropriateDisposal> {
        const disposal = await this.inappropriateDisposalModel.findById(id).exec();
        if (!disposal) {
            throw new NotFoundException(`Inappropriate disposal with ID ${id} not found`);
        }
        return disposal;
    }

    async delete(id: string): Promise<InappropriateDisposal> {
        const disposal = await this.inappropriateDisposalModel.findByIdAndDelete(id).exec();
        if (!disposal) {
            throw new NotFoundException(`Inappropriate disposal with ID ${id} not found`);
        }
        return disposal;
    }
}
