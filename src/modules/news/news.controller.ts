import { Controller, Get, Param, Query } from '@nestjs/common';
import { NewsService } from './news.service.js';
import { GetNewsQueryDto } from './dto/get-news-query.dto.js';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('categories/:slug/competitions')
  async getCompetitions(@Param('slug') slug: string) {
    return this.newsService.getCompetitionsBySport(slug);
  }

  @Get()
  async getNewsFeed(@Query() query: GetNewsQueryDto) {
    return this.newsService.getInfiniteNewsFeed(query);
  }
}
