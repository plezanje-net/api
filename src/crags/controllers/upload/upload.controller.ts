import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ImagesService } from '../../services/images.service';
import { NonGQLUserAuthGuard } from '../../../auth/guards/non-gql-user-auth.guard';
import { User } from '../../../users/entities/user.entity';
import { NonGqlCurrentUser } from '../../../auth/decorators/non-gql-current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadImageDto } from '../../dtos/upload-image.dto';

@Controller('upload')
@UseGuards(NonGQLUserAuthGuard)
export class UploadController {
  constructor(private imagesService: ImagesService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Body() uploadImageDto: UploadImageDto,
    @UploadedFile()
    imageFile: Express.Multer.File,
    @NonGqlCurrentUser() currentUser: User,
  ) {
    if (!imageFile) {
      throw new BadRequestException();
    }

    return this.imagesService.createImage(
      uploadImageDto,
      imageFile,
      currentUser,
    );
  }
}
