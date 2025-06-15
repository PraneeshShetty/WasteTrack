import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InappropriateDisposalsService } from './inappropriate-disposals.service';
import { InappropriateDisposalsController } from './inappropriate-disposals.controller';
import { InappropriateDisposal, InappropriateDisposalSchema } from './schemas/inappropriate-disposal.schema';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '24h' },
        }),
        MongooseModule.forRoot(process.env.MONGODB_URI),
        MongooseModule.forFeature([{ name: InappropriateDisposal.name, schema: InappropriateDisposalSchema }]),
    ],
    controllers: [InappropriateDisposalsController],
    providers: [InappropriateDisposalsService, AuthGuard, JwtService],
})
export class InappropriateDisposalsModule {}
