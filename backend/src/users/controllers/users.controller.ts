import { 
  Controller, 
  Get, 
  Put, 
  Delete,
  Body, 
  UseGuards,
  Version,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { UsersService } from '../services/users.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserType } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ 
    summary: 'Get current user profile',
    description: 'Retrieves the complete profile of the authenticated user including financial profile data',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: 'uuid',
          email: 'user@example.com',
          fullName: 'John Doe',
          phone: '+1234567890',
          address: '123 Main St',
          isEmailVerified: true,
          profile: {
            monthlyIncome: 5000,
            financialGoals: ['retirement', 'house'],
            riskTolerance: 'moderate',
          },
        },
      },
    },
  })
  @Get('profile')
  async getProfile(@CurrentUser() user: CurrentUserType) {
    return this.usersService.getProfile(user.id);
  }

  @ApiOperation({ 
    summary: 'Update user financial profile',
    description: 'Updates the financial profile information including income, goals, and risk tolerance',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile updated successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: 'profile-uuid',
          monthlyIncome: 6000,
          financialGoals: ['retirement', 'house', 'emergency_fund'],
          riskTolerance: 'aggressive',
          user: {
            id: 'user-uuid',
            email: 'user@example.com',
            fullName: 'John Doe',
          },
        },
      },
    },
  })
  @ApiBody({ type: UpdateProfileDto })
  @Put('profile')
  async updateProfile(
    @CurrentUser() user: CurrentUserType,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }

  @ApiOperation({ 
    summary: 'Update user general data',
    description: 'Updates general user information like name, email, phone, and address',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User updated successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: 'uuid',
          email: 'newemail@example.com',
          fullName: 'John Updated Doe',
          phone: '+1987654321',
          address: '456 New St',
          isEmailVerified: true,
        },
      },
    },
  })
  @ApiBody({ type: UpdateUserDto })
  @Put()
  async updateUser(
    @CurrentUser() user: CurrentUserType,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(user.id, updateUserDto);
  }

  @ApiOperation({ 
    summary: 'Update user name',
    description: 'Updates only the user full name',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Name updated successfully',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName: {
          type: 'string',
          example: 'John Updated Name',
        },
      },
      required: ['fullName'],
    },
  })
  @Put('name')
  async updateName(
    @CurrentUser() user: CurrentUserType,
    @Body('fullName') fullName: string,
  ) {
    return this.usersService.updateUser(user.id, { fullName });
  }

  @ApiOperation({ 
    summary: 'Update user email',
    description: 'Updates user email and resets email verification status',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Email updated successfully',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'newemail@example.com',
        },
      },
      required: ['email'],
    },
  })
  @Put('email')
  async updateEmail(
    @CurrentUser() user: CurrentUserType,
    @Body('email') email: string,
  ) {
    return this.usersService.updateUser(user.id, { email, isEmailVerified: false });
  }

  @ApiOperation({ 
    summary: 'Update user phone',
    description: 'Updates user phone number',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Phone updated successfully',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phone: {
          type: 'string',
          example: '+1987654321',
        },
      },
      required: ['phone'],
    },
  })
  @Put('phone')
  async updatePhone(
    @CurrentUser() user: CurrentUserType,
    @Body('phone') phone: string,
  ) {
    return this.usersService.updateUser(user.id, { phone });
  }

  @ApiOperation({ 
    summary: 'Update user address',
    description: 'Updates user address',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Address updated successfully',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          example: '456 New Street, City, State',
        },
      },
      required: ['address'],
    },
  })
  @Put('address')
  async updateAddress(
    @CurrentUser() user: CurrentUserType,
    @Body('address') address: string,
  ) {
    return this.usersService.updateUser(user.id, { address });
  }

  @ApiOperation({ 
    summary: 'Delete user account',
    description: 'Permanently deletes the user account and all associated data',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User deleted successfully',
    schema: {
      example: {
        success: true,
        data: {
          message: 'User deleted successfully',
        },
      },
    },
  })
  @Delete()
  async deleteUser(@CurrentUser() user: CurrentUserType) {
    return this.usersService.deleteUser(user.id);
  }
}