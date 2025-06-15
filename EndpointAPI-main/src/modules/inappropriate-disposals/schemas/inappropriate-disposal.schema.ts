import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GarbageType } from "../../utils/schemas/garbage-type.enum";

export type InappropriateDisposalDocument = InappropriateDisposal & Document;

@Schema({ collection: 'inappropriate-disposals', timestamps: true })
export class InappropriateDisposal {
    _id: string;

    @Prop({ required: true, type: String })
    userId: string;

    @Prop({ required: true, type: String, enum: GarbageType })
    wasteType: GarbageType;

    @Prop({ required: true, type: String })
    address: string;

    @Prop({ required: true, type: Number })
    latitude: number;

    @Prop({ required: true, type: Number })
    longitude: number;

    @Prop({ type: [String], required: true })
    images: string[];

    @Prop({ type: String })
    notes?: string;

    @Prop({ type: String })
    reportedBy?: string;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const InappropriateDisposalSchema = SchemaFactory.createForClass(InappropriateDisposal);
