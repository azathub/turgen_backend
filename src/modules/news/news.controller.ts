import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { NewsService } from './news.service.js';
import { GetNewsQueryDto } from './dto/get-news-query.dto.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { CompetitionResponseDto } from './dto/competition-response.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('categories/:slug/competitions')
  @ApiOperation({ summary: 'List competitions in a sport category (public)' })
  @ApiParam({ name: 'slug', example: 'football' })
  @ApiOkResponse({
    description: 'Competitions for the category, including their image URLs',
    type: CompetitionResponseDto,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'Category not found' })
  async getCompetitions(@Param('slug') slug: string) {
    return this.newsService.getCompetitionsBySport(slug);
  }

  @Get()
  @ApiOperation({ summary: 'Get the public, cursor-paginated news feed' })
  @ApiOkResponse({ description: 'News posts and the next pagination cursor' })
  async getNewsFeed(@Query() query: GetNewsQueryDto) {
    return this.newsService.getInfiniteNewsFeed(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a public news post by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'The news post' })
  @ApiNotFoundResponse({ description: 'News post not found' })
  getNewsPost(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.getNewsPost(id);
  }

  @Get(':id/share-link')
  @ApiOperation({
    summary: 'Get a public link and share text for external social platforms',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Public URL, title, and text for sharing' })
  @ApiNotFoundResponse({ description: 'News post not found' })
  getShareLink(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.getShareLink(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a news post (admin only)' })
  @ApiCreatedResponse({ description: 'News post created' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  createPost(@Body() body: CreatePostDto) {
    return this.newsService.createPost(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit a news post (admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'News post updated' })
  @ApiNotFoundResponse({ description: 'News post not found' })
  updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
  ) {
    return this.newsService.updatePost(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a news post (admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'News post deleted' })
  @ApiNotFoundResponse({ description: 'News post not found' })
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.deletePost(id);
  }
}
