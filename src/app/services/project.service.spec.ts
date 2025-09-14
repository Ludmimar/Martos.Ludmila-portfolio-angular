import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProjectService, Project, ProjectData } from './project';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  const mockProjectData: ProjectData = {
    projects: [
      {
        id: 1,
        title: 'Test Project',
        description: 'Test Description',
        stack: 'Angular · TypeScript',
        image: 'test-image.png',
        githubLink: 'https://github.com/test',
        demoLink: 'https://demo.test',
        featured: true,
        category: 'frontend',
        technologies: ['Angular', 'TypeScript'],
        status: 'completed',
        date: '2024-01-01'
      }
    ],
    categories: [
      {
        id: 'frontend',
        name: 'Frontend',
        description: 'Frontend projects'
      }
    ],
    technologies: ['Angular', 'TypeScript', 'JavaScript']
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectService]
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load projects from JSON', () => {
    service.loadProjects().subscribe(data => {
      expect(data).toEqual(mockProjectData);
      expect(data.projects.length).toBe(1);
    });

    const req = httpMock.expectOne('assets/data/projects.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockProjectData);
  });

  it('should return fallback projects on error', () => {
    service.loadProjects().subscribe(data => {
      expect(data.projects.length).toBeGreaterThan(0);
      expect(data.categories.length).toBeGreaterThan(0);
    });

    const req = httpMock.expectOne('assets/data/projects.json');
    req.error(new ErrorEvent('Network error'));
  });

  it('should get projects', () => {
    const projects = service.getProjects();
    expect(projects).toBeDefined();
    expect(Array.isArray(projects)).toBe(true);
  });

  it('should get featured projects', () => {
    // Mock the projects data
    (service as any).projectsData = mockProjectData;
    
    const featuredProjects = service.getFeaturedProjects();
    expect(featuredProjects.length).toBe(1);
    expect(featuredProjects[0].featured).toBe(true);
  });

  it('should get projects by category', () => {
    (service as any).projectsData = mockProjectData;
    
    const frontendProjects = service.getProjectsByCategory('frontend');
    expect(frontendProjects.length).toBe(1);
    expect(frontendProjects[0].category).toBe('frontend');
  });

  it('should get project by id', () => {
    (service as any).projectsData = mockProjectData;
    
    const project = service.getProjectById(1);
    expect(project).toBeDefined();
    expect(project?.id).toBe(1);
    expect(project?.title).toBe('Test Project');
  });

  it('should return undefined for non-existent project id', () => {
    (service as any).projectsData = mockProjectData;
    
    const project = service.getProjectById(999);
    expect(project).toBeUndefined();
  });

  it('should get categories', () => {
    (service as any).projectsData = mockProjectData;
    
    const categories = service.getCategories();
    expect(categories.length).toBe(1);
    expect(categories[0].id).toBe('frontend');
  });

  it('should get technologies', () => {
    (service as any).projectsData = mockProjectData;
    
    const technologies = service.getTechnologies();
    expect(technologies.length).toBe(3);
    expect(technologies).toContain('Angular');
  });
});
