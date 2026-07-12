import { Module } from '@nestjs/common';
import { CommentsModule } from '../comments/comments.module';
import { PostsModule } from '../posts/posts.module';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';

@Module({
  imports: [PostsModule, CommentsModule],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
