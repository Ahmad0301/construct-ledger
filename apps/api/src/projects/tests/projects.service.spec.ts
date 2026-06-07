import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from '../projects.service';
import { SUPABASE_CLIENT } from '../../common/supabase.module';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

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

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: SUPABASE_CLIENT, useValue: mockSupabase },
      ],
    }).compile();
    service = module.get<ProjectsService>(ProjectsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return projects for a user', async () => {
      const mockProjects = [{ id: 'proj-1', name: 'Test Project' }];
      mockSupabase.or.mockResolvedValue({ data: mockProjects, error: null });
      const result = await service.findAll('user-123');
      expect(result).toEqual(mockProjects);
    });

    it('should throw on supabase error', async () => {
      mockSupabase.or.mockResolvedValue({ data: null, error: { message: 'DB error' } });
      await expect(service.findAll('user-123')).rejects.toThrow('DB error');
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if project not found', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: { message: 'not found' } });
      await expect(service.findOne('bad-id', 'user-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user has no access', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { homeowner_id: 'other-user', contractor_id: 'other-contractor', project_members: [] },
        error: null,
      });
      await expect(service.findOne('proj-1', 'user-123')).rejects.toThrow(ForbiddenException);
    });

    it('should return project if user is homeowner', async () => {
      const mockProject = { id: 'proj-1', homeowner_id: 'user-123', contractor_id: null, project_members: [] };
      mockSupabase.single.mockResolvedValue({ data: mockProject, error: null });
      const result = await service.findOne('proj-1', 'user-123');
      expect(result).toEqual(mockProject);
    });
  });

  describe('create', () => {
    it('should create a project and write ledger entry', async () => {
      const newProject = { id: 'proj-new', name: 'New Build' };
      mockSupabase.single.mockResolvedValueOnce({ data: newProject, error: null });
      // Ledger insert
      mockSupabase.insert = jest.fn().mockReturnThis();
      mockSupabase.single.mockResolvedValueOnce({ data: {}, error: null });
      const result = await service.create({ name: 'New Build', address: '123 Main St' } as any, 'user-123');
      expect(result).toEqual(newProject);
    });
  });
});
