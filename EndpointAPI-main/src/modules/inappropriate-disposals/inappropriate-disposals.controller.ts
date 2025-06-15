import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { InappropriateDisposalsService } from './inappropriate-disposals.service';
import { CreateInappropriateDisposalDto } from './dto/create-inappropriate-disposal.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ApiTags, ApiOperation, ApiOkResponse, ApiUnauthorizedResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('inappropriate-disposals')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('inappropriate-disposals')
export class InappropriateDisposalsController {
    constructor(private readonly inappropriateDisposalsService: InappropriateDisposalsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new inappropriate disposal report' })
    @ApiOkResponse()
    @ApiUnauthorizedResponse()
    async create(@Req() request: Request, @Body() createDto: CreateInappropriateDisposalDto) {
        const userId = request['user'].userId;
        return this.inappropriateDisposalsService.create(createDto, userId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all inappropriate disposal reports' })
    @ApiOkResponse()
    @ApiUnauthorizedResponse()
    async findAll() {
        return this.inappropriateDisposalsService.findAll();
    }

    @Get('user')
    @ApiOperation({ summary: 'Get all inappropriate disposal reports for the current user' })
    @ApiOkResponse()
    @ApiUnauthorizedResponse()
    async findMyDisposals(@Req() request: Request) {
        const userId = request['user'].userId;
        return this.inappropriateDisposalsService.findByUserId(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific inappropriate disposal report' })
    @ApiOkResponse()
    @ApiUnauthorizedResponse()
    async findOne(@Param('id') id: string) {
        return this.inappropriateDisposalsService.findOne(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an inappropriate disposal report' })
    @ApiOkResponse()
    @ApiUnauthorizedResponse()
    async delete(@Param('id') id: string) {
        return this.inappropriateDisposalsService.delete(id);
    }
}
