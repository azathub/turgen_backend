import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { SocialService } from './social.service.js';

@ApiTags('Social')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing, invalid, or expired token' })
@UseGuards(JwtAuthGuard)
@Controller()
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('me/bookmarks')
  @ApiOperation({ summary: 'List the authenticated user’s bookmarks' })
  getBookmarks(@Req() request: AuthenticatedRequest) {
    return this.socialService.getBookmarks(request.user.sub);
  }

  @Put('social/news/:postId/bookmark')
  @ApiOperation({ summary: 'Bookmark a post' })
  @ApiParam({ name: 'postId', type: Number })
  bookmark(
    @Req() request: AuthenticatedRequest,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.socialService.bookmark(request.user.sub, postId);
  }

  @Delete('social/news/:postId/bookmark')
  @ApiOperation({ summary: 'Remove a bookmark' })
  @ApiParam({ name: 'postId', type: Number })
  removeBookmark(
    @Req() request: AuthenticatedRequest,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.socialService.removeBookmark(request.user.sub, postId);
  }

  @Put('social/news/:postId/like')
  @ApiOperation({ summary: 'Like a post' })
  @ApiParam({ name: 'postId', type: Number })
  like(
    @Req() request: AuthenticatedRequest,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.socialService.like(request.user.sub, postId);
  }

  @Delete('social/news/:postId/like')
  @ApiOperation({ summary: 'Remove a like from a post' })
  @ApiParam({ name: 'postId', type: Number })
  unlike(
    @Req() request: AuthenticatedRequest,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.socialService.unlike(request.user.sub, postId);
  }

  @Get('social/news/:postId/likes')
  @ApiOperation({ summary: 'Get the number of likes on a post' })
  @ApiParam({ name: 'postId', type: Number })
  getLikes(@Param('postId', ParseIntPipe) postId: number) {
    return this.socialService.getLikes(postId);
  }

  @Get('social/news/:postId/comments')
  @ApiOperation({ summary: 'List comments on a post' })
  @ApiParam({ name: 'postId', type: Number })
  getComments(@Param('postId', ParseIntPipe) postId: number) {
    return this.socialService.getComments(postId);
  }

  @Post('social/news/:postId/comments')
  @ApiOperation({ summary: 'Comment on a post' })
  @ApiParam({ name: 'postId', type: Number })
  @ApiCreatedResponse({ description: 'Comment created' })
  createComment(
    @Req() request: AuthenticatedRequest,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() body: CreateCommentDto,
  ) {
    return this.socialService.createComment(
      request.user.sub,
      postId,
      body.content,
    );
  }

  @Delete('social/comments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete your comment (admins may delete any comment)',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse({ description: 'Comment deleted' })
  deleteComment(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.socialService.deleteComment(
      id,
      request.user.sub,
      request.user.role,
    );
  }
}
