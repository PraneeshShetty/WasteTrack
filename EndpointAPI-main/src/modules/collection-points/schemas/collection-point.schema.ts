import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';
import { GarbageType } from "src/modules/utils/schemas/garbage-type.enum";

export type CollectionPointDocument = CollectionPoint & Document;
// Add before the @Schema class definition:
export interface CollectionPoint {
  _id: string;
  location: string;
  latitude: number;
  longitude: number;
  acceptsGargabeTypes: GarbageType[];
}

@Schema({ collection: 'collection-points' })
export class CollectionPoint {
    _id: string;

    @Prop({ required: true, type: [String], enum: GarbageType})
    acceptsGargabeTypes: GarbageType[];
    
    @Prop({ required: true, type: String })
    location: string;

    @Prop({ required: true, type: Number })
    latitude: number;
    
    @Prop({ required: true, type: Number })
    longitude: number;
}

export const CollectionPointSchema = SchemaFactory.createForClass(CollectionPoint);
