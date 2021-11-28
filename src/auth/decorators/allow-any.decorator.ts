import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const AllowAny = (): CustomDecorator<string> => SetMetadata('allow-any', true);