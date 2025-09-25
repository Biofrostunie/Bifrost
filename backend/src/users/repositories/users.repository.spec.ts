import { Test, TestingModule } from '@nestjs/testing';
import { Decimal } from '@prisma/client/runtime/library';

import { UsersRepository } from './users.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let prisma: jest.Mocked<PrismaService>;

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
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

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      userProfile: {
        upsert: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        fullName: 'Test User',
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.create(createUserDto);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.findById('user-id');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.findByEmail('test@example.com');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmailVerificationToken', () => {
    it('should find user by verification token', async () => {
      const userWithToken = {
        ...mockUser,
        emailVerificationToken: 'verification-token',
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(userWithToken);

      const result = await repository.findByEmailVerificationToken('verification-token');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { emailVerificationToken: 'verification-token' },
      });
      expect(result).toEqual(userWithToken);
    });
  });

  describe('findByPasswordResetToken', () => {
    it('should find user by password reset token', async () => {
      const userWithResetToken = {
        ...mockUser,
        passwordResetToken: 'reset-token',
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(userWithResetToken);

      const result = await repository.findByPasswordResetToken('reset-token');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { passwordResetToken: 'reset-token' },
      });
      expect(result).toEqual(userWithResetToken);
    });
  });

  describe('findByIdWithProfile', () => {
    it('should find user with profile', async () => {
      const userWithProfile = {
        ...mockUser,
        profile: {
          id: 'profile-id',
          userId: 'user-id',
          monthlyIncome: new Decimal(5000),
          financialGoals: ['retirement'],
          riskTolerance: 'moderate',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(userWithProfile);

      const result = await repository.findByIdWithProfile('user-id');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        include: { profile: true },
      });
      expect(result).toEqual(userWithProfile);
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
        userId: 'user-id',
        monthlyIncome: new Decimal(6000),
        financialGoals: ['house', 'retirement'],
        riskTolerance: 'aggressive',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user-id',
          email: 'test@example.com',
          fullName: 'Test User',
          phone: null,
          address: null,
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      (prisma.userProfile.upsert as jest.Mock).mockResolvedValue(mockProfileResult);

      const result = await repository.updateProfile('user-id', updateProfileDto);

      expect(prisma.userProfile.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        update: {
          monthlyIncome: new Decimal(6000),
          financialGoals: ['house', 'retirement'],
          riskTolerance: 'aggressive',
        },
        create: {
          userId: 'user-id',
          monthlyIncome: new Decimal(6000),
          financialGoals: ['house', 'retirement'],
          riskTolerance: 'aggressive',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phone: true,
              address: true,
              isEmailVerified: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });
      expect(result).toEqual(mockProfileResult);
    });

    it('should handle profile update without monthlyIncome', async () => {
      const updateProfileDto = {
        financialGoals: ['education'],
      };

      const mockProfileResult = {
        id: 'profile-id',
        userId: 'user-id',
        monthlyIncome: null,
        financialGoals: ['education'],
        riskTolerance: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user-id',
          email: 'test@example.com',
          fullName: 'Test User',
          phone: null,
          address: null,
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      (prisma.userProfile.upsert as jest.Mock).mockResolvedValue(mockProfileResult);

      const result = await repository.updateProfile('user-id', updateProfileDto);

      expect(result).toEqual(mockProfileResult);
    });
  });

  describe('updateUser', () => {
    it('should update user data', async () => {
      const updateUserDto = {
        fullName: 'Updated Name',
        phone: '+1234567890',
      };

      const updatedUser = {
        ...mockUser,
        fullName: 'Updated Name',
        phone: '+1234567890',
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await repository.updateUser('user-id', updateUserDto);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: updateUserDto,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should filter out undefined values', async () => {
      const updateUserDto = {
        fullName: 'Updated Name',
        phone: undefined,
        address: 'New Address',
      };

      const filteredData = {
        fullName: 'Updated Name',
        address: 'New Address',
      };

      const updatedUser = {
        ...mockUser,
        fullName: 'Updated Name',
        address: 'New Address',
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await repository.updateUser('user-id', updateUserDto);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: filteredData,
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      (prisma.user.delete as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.deleteUser('user-id');

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
      expect(result).toEqual(mockUser);
    });
  });
});