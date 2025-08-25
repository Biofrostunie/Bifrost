import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

import { UsersService } from './users.service';
import { UsersRepository } from '../repositories/users.repository';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    passwordHash: 'hashedPassword',
    fullName: 'Test User',
    phone: null,
    address: null,
    isEmailVerified: false,
    emailVerificationToken: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserWithProfile = {
    ...mockUser,
    profile: {
      id: 'profile-id',
      userId: mockUser.id,
      monthlyIncome: new Decimal(5000),
      financialGoals: ['retirement'],
      riskTolerance: 'moderate',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByIdWithProfile: jest.fn(),
      updateProfile: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      findByEmailVerificationToken: jest.fn(),
      findByPasswordResetToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        fullName: 'Test User',
      };

      repository.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should handle creation with minimal data', async () => {
      const createUserDto = {
        email: 'minimal@example.com',
        passwordHash: 'hashedPassword',
      };

      const minimalUser = {
        ...mockUser,
        email: 'minimal@example.com',
        fullName: null,
      };

      repository.create.mockResolvedValue(minimalUser);

      const result = await service.create(createUserDto);

      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(minimalUser);
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      repository.findById.mockResolvedValue(mockUser);

      const result = await service.findById(mockUser.id);

      expect(repository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.findById('nonexistent-id');

      expect(result).toBeNull();
    });

    it('should handle invalid UUID format', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.findById('invalid-uuid');

      expect(repository.findById).toHaveBeenCalledWith('invalid-uuid');
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      repository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockUser.email);

      expect(repository.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(result).toEqual(mockUser);
    });

    it('should return null for non-existent email', async () => {
      repository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should handle case-sensitive email search', async () => {
      repository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('TEST@EXAMPLE.COM');

      expect(repository.findByEmail).toHaveBeenCalledWith('TEST@EXAMPLE.COM');
      expect(result).toBeNull();
    });
  });

  describe('findByEmailVerificationToken', () => {
    it('should return user by verification token', async () => {
      const userWithToken = {
        ...mockUser,
        emailVerificationToken: 'verification-token',
      };

      repository.findByEmailVerificationToken.mockResolvedValue(userWithToken);

      const result = await service.findByEmailVerificationToken('verification-token');

      expect(repository.findByEmailVerificationToken).toHaveBeenCalledWith('verification-token');
      expect(result).toEqual(userWithToken);
    });

    it('should return null for invalid token', async () => {
      repository.findByEmailVerificationToken.mockResolvedValue(null);

      const result = await service.findByEmailVerificationToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('findByPasswordResetToken', () => {
    it('should return user by reset token', async () => {
      const userWithResetToken = {
        ...mockUser,
        passwordResetToken: 'reset-token',
        passwordResetExpires: new Date(Date.now() + 3600000),
      };

      repository.findByPasswordResetToken.mockResolvedValue(userWithResetToken);

      const result = await service.findByPasswordResetToken('reset-token');

      expect(repository.findByPasswordResetToken).toHaveBeenCalledWith('reset-token');
      expect(result).toEqual(userWithResetToken);
    });

    it('should return null for invalid reset token', async () => {
      repository.findByPasswordResetToken.mockResolvedValue(null);

      const result = await service.findByPasswordResetToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      repository.findByIdWithProfile.mockResolvedValue(mockUserWithProfile);

      const result = await service.getProfile(mockUser.id);

      expect(repository.findByIdWithProfile).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
        id: mockUserWithProfile.id,
        email: mockUserWithProfile.email,
        fullName: mockUserWithProfile.fullName,
        phone: mockUserWithProfile.phone,
        address: mockUserWithProfile.address,
        isEmailVerified: mockUserWithProfile.isEmailVerified,
        emailVerificationToken: mockUserWithProfile.emailVerificationToken,
        passwordResetToken: mockUserWithProfile.passwordResetToken,
        passwordResetExpires: mockUserWithProfile.passwordResetExpires,
        createdAt: mockUserWithProfile.createdAt,
        updatedAt: mockUserWithProfile.updatedAt,
        profile: mockUserWithProfile.profile,
      });
    });

    it('should return user without profile', async () => {
      const userWithoutProfile = {
        ...mockUser,
        profile: null,
      };

      repository.findByIdWithProfile.mockResolvedValue(userWithoutProfile);

      const result = await service.getProfile(mockUser.id);

      expect(result.profile).toBeNull();
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findByIdWithProfile.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent-id')).rejects.toThrow(NotFoundException);
      expect(repository.findByIdWithProfile).toHaveBeenCalledWith('nonexistent-id');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateProfileDto = {
        monthlyIncome: 6000,
        financialGoals: ['house', 'retirement'],
        riskTolerance: 'aggressive' as const,
      };

      const mockProfileResult = {
        id: 'profile-id',
        userId: mockUser.id,
        monthlyIncome: new Decimal(updateProfileDto.monthlyIncome),
        financialGoals: updateProfileDto.financialGoals,
        riskTolerance: updateProfileDto.riskTolerance,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: mockUser.id,
          email: mockUser.email,
          fullName: mockUser.fullName,
          phone: mockUser.phone,
          address: mockUser.address,
          isEmailVerified: mockUser.isEmailVerified,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      };

      repository.findById.mockResolvedValue(mockUser);
      repository.updateProfile.mockResolvedValue(mockProfileResult);

      const result = await service.updateProfile(mockUser.id, updateProfileDto);

      expect(repository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(repository.updateProfile).toHaveBeenCalledWith(mockUser.id, updateProfileDto);
      expect(result).toBeDefined();
    });

    it('should update profile with partial data', async () => {
      const updateProfileDto = {
        monthlyIncome: 7000,
      };

      const mockProfileResult = {
        id: 'profile-id',
        userId: mockUser.id,
        monthlyIncome: new Decimal(7000),
        financialGoals: ['retirement'],
        riskTolerance: 'moderate',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: mockUser.id,
          email: mockUser.email,
          fullName: mockUser.fullName,
          phone: mockUser.phone,
          address: mockUser.address,
          isEmailVerified: mockUser.isEmailVerified,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      };

      repository.findById.mockResolvedValue(mockUser);
      repository.updateProfile.mockResolvedValue(mockProfileResult);

      const result = await service.updateProfile(mockUser.id, updateProfileDto);

      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.updateProfile('nonexistent-id', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUser', () => {
    it('should update user data', async () => {
      const updateData = { fullName: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updateData };

      repository.findById.mockResolvedValue(mockUser);
      repository.updateUser.mockResolvedValue(updatedUser);

      const result = await service.updateUser(mockUser.id, updateData);

      expect(repository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(repository.updateUser).toHaveBeenCalledWith(mockUser.id, updateData);
      expect(result).toEqual(updatedUser);
    });

    it('should update multiple fields', async () => {
      const updateData = {
        fullName: 'New Name',
        phone: '+1234567890',
        address: '123 New Street',
      };
      const updatedUser = { ...mockUser, ...updateData };

      repository.findById.mockResolvedValue(mockUser);
      repository.updateUser.mockResolvedValue(updatedUser);

      const result = await service.updateUser(mockUser.id, updateData);

      expect(result.fullName).toBe('New Name');
      expect(result.phone).toBe('+1234567890');
      expect(result.address).toBe('123 New Street');
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.updateUser('nonexistent-id', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      repository.findById.mockResolvedValue(mockUser);
      repository.deleteUser.mockResolvedValue(mockUser);

      const result = await service.deleteUser(mockUser.id);

      expect(repository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(repository.deleteUser).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({ message: 'User deleted successfully' });
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.deleteUser('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });
});