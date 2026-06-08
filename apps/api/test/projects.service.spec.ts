import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from '../src/modules/projects/projects.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ProjectsService', () => {
  let service: ProjectsService;
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: 'SUPABASE_CLIENT', useValue: mockSupabase },
      ],
    }).compile();
    service = module.get<ProjectsService>(ProjectsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('throws NotFoundException when project does not exist', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'not found' } });
      await expect(service.findOne('non-existent-id', 'user-id')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when user is not a participant', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'proj-1',
          homeowner_id: 'owner-123',
          contractor_id: 'contractor-456',
          financier_id: null,
        },
        error: null,
      });
      await expect(service.findOne('proj-1', 'random-user-789')).rejects.toThrow(ForbiddenException);
    });

    it('returns project when user is the homeowner', async () => {
      const projectData = {
        id: 'proj-1',
        title: 'Kitchen Reno',
        homeowner_id: 'owner-123',
        contractor_id: 'contractor-456',
        financier_id: null,
      };
      mockSupabase.single.mockResolvedValueOnce({ data: projectData, error: null });
      const result = await service.findOne('proj-1', 'owner-123');
      expect(result.id).toBe('proj-1');
    });
  });

  describe('create', () => {
    it('creates a project and logs activity', async () => {
      const newProject = { id: 'proj-new', title: 'New Build', homeowner_id: 'owner-1' };
      mockSupabase.single
        .mockResolvedValueOnce({ data: newProject, error: null }) // insert
        .mockResolvedValueOnce({ data: {}, error: null });          // activity log
      const result = await service.create(
        { title: 'New Build', address: '123 Main St' },
        'owner-1'
      );
      expect(result.title).toBe('New Build');
    });
  });
});
