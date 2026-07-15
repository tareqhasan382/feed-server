import { LikeUserDto } from '../dto/like-response.dto';
import { LikeUserRecord } from '../types/like.types';

export function mapLikeUser(record: LikeUserRecord): LikeUserDto {
  return {
    id: record.user.id,
    firstName: record.user.firstName,
    lastName: record.user.lastName,
    avatar: record.user.avatar,
    createdAt: record.createdAt,
  };
}
