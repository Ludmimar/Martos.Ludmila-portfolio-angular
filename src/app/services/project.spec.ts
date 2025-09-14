import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { ProjectService, Project, ProjectCategory, ProjectData } from './project';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  const mockProjectsData: ProjectData = {
    projects: [
      {
        id: 1,
        title: 'Test Project',
        description: 'Test description',
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
    technologies: ['Angular', 'TypeScript']
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

  describe('loadProjects', () => {
    it('should load projects from API successfully', () => {
      service.loadProjects().subscribe(data => {
        expect(data).toEqual(mockProjectsData);
        expect(data.projects).toHaveLength(1);
        expect(data.projects[0].title).toBe('Test Project');
      });

      const req = httpMock.expectOne('/assets/data/projects.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockProjectsData);
    });

    it('should return cached data on subsequent calls', () => {
      // First call
      service.loadProjects().subscribe();
      const req1 = httpMock.expectOne('/assets/data/projects.json');
      req1.flush(mockProjectsData);

      // Second call should use cache
      service.loadProjects().subscribe(data => {
        expect(data).toEqual(mockProjectsData);
      });

      // Should not make another HTTP request
      httpMock.expectNone('/assets/data/projects.json');
    });

    it('should handle HTTP error and return fallback data', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      service.loadProjects().subscribe(data => {
        expect(data.projects).toBeDefined();
        expect(data.categories).toBeDefined();
        expect(data.technologies).toBeDefined();
        expect(data.projects.length).toBeGreaterThan(0);
      });

      const req = httpMock.expectOne('/assets/data/projects.json');
      req.error(new ErrorEvent('Network error'));

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle malformed JSON response', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      service.loadProjects().subscribe(data => {
        expect(data.projects).toBeDefined();
        expect(data.categories).toBeDefined();
        expect(data.technologies).toBeDefined();
      });

      const req = httpMock.expectOne('/assets/data/projects.json');
      req.flush('invalid json');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('getProjects', () => {
    it('should return projects from loaded data', () => {
      service.loadProjects().subscribe();
      const req = httpMock.expectOne('/assets/data/projects.json');
      req.flush(mockProjectsData);

      const projects = service.getProjects();
      expect(projects).toEqual(mockProjectsData.projects);
    });

    it('should return fallback projects when no data loaded', () => {
      const projects = service.getProjects();
      expect(projects).toBeDefined();
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBeGreaterThan(0);
    });
  });

  describe('getFeaturedProjects', () => {
    it('should return only featured projects', () => {
      service.loadProjects().subscribe();
      const req = httpMock.expectOne('/assets/data/projects.json');
      req.flush(mockProjectsData);

      const featuredProjects = service.getFeaturedProjects();
      expect(featuredProjects).toHaveLength(1);
      expect(featuredProjects[0].featured).toBe(true);
    });

    it('should return empty array when no featured projects', () => {
      const noFeaturedData = {
        ...mockProjectsData,
        projects: [{ ...mockProjectsData.projects[0], featured: false }]
      };

      service.loadProjects().subscribe();
      const req = httpMock.expectOne('/assets/data/projects.json');
      req.flush(noFeaturedData);

      const featuredProjects = service.getFeaturedProjects();
      expect(featuredProjects).toHaveLength(0);
    });
  });

  describe('getProjectsByCategory', () => {
    it('should return projects filtered by category', () => {
      service.loadProjects().subscribe();
      const req = httpMock.expectOne('/assets/data/projects.json');
      req.flush(mockProjectsData);

      const frontendProjects = service.getProjectsByCategory('frontend');
      expect(frontendProjects).toHaveLength(1);
      expect(frontendProjects[0].category).toBe('frontend');
    });

    it('should return empty array for non-existent category', () => {
      service.loadProjects().subscribe();
      const req = httpMock.expectOne('/assets/data/projects.json');
      req.flush(mockProjectsData);

      const backendProjects = service.getProjectsByCategory('backend');
      expect(backendProjects).toHaveLength(0);
    });
  });

  describe('getProjectById', () => {
    it('should return project by ID', () => {
      service.loadProjects().subscribe();
      const req = httpMock.expectOne('/assets/data/projects.json');
      req.flush(mockProjectsData);

      const project = service.getProjectById(1);
      expect(project).toBeDefined();
      expect(project?.id).toBe(1);
      expect(project?.title).toBe('Test Project');
    });

    it('should return undefined for non-existent ID', () => {
      service.loadProjects().subscribe();
      const req = httpMock.expectOne('/assets/data/projects.json');
      req.flush(mockProjectsData);

      const project = service.getProjectById(999);
      expect(project).toBeUndefined();
    });
  });

  describe('getCategories', () => {
    it('should return categories from loaded data', () => {
      service.loadProjects().subscribe();
      const req = httpMock.expectOne('/assets/data/projects.json');
      req.flush(mockProjectsData);

      const categories = service.getCategories();
      expect(categories).toEqual(mockProjectsData.categories);
    });

    it('should return empty array when no data loaded', () => {
      const categories = service.getCategories();
      expect(categories).toEqual([]);
    });
  });

  describe('getTechnologies', () => {
    it('should return technologies from loaded data', () => {
      service.loadProjects().subscribe();
      const req = httpMock.expectOne('/assets/data/projects.json');
      req.flush(mockProjectsData);

      const technologies = service.getTechnologies();
      expect(technologies).toEqual(mockProjectsData.technologies);
    });

    it('should return empty array when no data loaded', () => {
      const technologies = service.getTechnologies();
      expect(technologies).toEqual([]);
    });
  });

  describe('addProject', () => {
    it('should add new project with generated ID', () => {
      const newProjectData = {
        title: 'New Project',
        description: 'New description',
        stack: 'React · TypeScript',
        image: 'new-image.png',
        githubLink: 'https://github.com/new',
        featured: false,
        category: 'frontend',
        technologies: ['React', 'TypeScript'],
        status: 'completed',
        date: '2024-02-01'
      };

      service.addProject(newProjectData).subscribe(project => {
        expect(project.id).toBeDefined();
        expect(project.title).toBe('New Project');
        expect(project.id).toBeGreaterThan(0);
      });
    });

    it('should handle empty projects array when adding new project', () => {
      // Reset service to have no projects
      const httpClient = TestBed.inject(HttpClient);
      const emptyService = new ProjectService(httpClient);
      
      const newProjectData = {
        title: 'First Project',
        description: 'First description',
        stack: 'Vue · TypeScript',
        image: 'first-image.png',
        githubLink: 'https://github.com/first',
        featured: false,
        category: 'frontend',
        technologies: ['Vue', 'TypeScript'],
        status: 'completed',
        date: '2024-02-01'
      };

      emptyService.addProject(newProjectData).subscribe(project => {
        expect(project.id).toBe(1);
        expect(project.title).toBe('First Project');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined project data gracefully', () => {
      const nullData = {
        projects: null as any,
        categories: null as any,
        technologies: null as any
      };

      service.loadProjects().subscribe(data => {
        expect(data.projects).toBeDefined();
        expect(data.categories).toBeDefined();
        expect(data.technologies).toBeDefined();
      });

      const req = httpMock.expectOne('/assets/data/projects.json');
      req.flush(nullData);
    });

    it('should handle empty projects array', () => {
      const emptyData = {
        projects: [],
        categories: [],
        technologies: []
      };

      service.loadProjects().subscribe(data => {
        expect(data.projects).toEqual([]);
        expect(data.categories).toEqual([]);
        expect(data.technologies).toEqual([]);
      });

      const req = httpMock.expectOne('/assets/data/projects.json');
      req.flush(emptyData);
    });

    it('should handle projects with missing optional fields', () => {
      const incompleteProject = {
        id: 1,
        title: 'Incomplete Project',
        description: 'Test description',
        stack: 'Angular',
        image: 'test.png',
        githubLink: 'https://github.com/test'
        // Missing optional fields
      };

      const incompleteData = {
        projects: [incompleteProject],
        categories: [],
        technologies: []
      };

      service.loadProjects().subscribe(data => {
        expect(data.projects[0]).toBeDefined();
        expect(data.projects[0].title).toBe('Incomplete Project');
        expect(data.projects[0].featured).toBeUndefined();
        expect(data.projects[0].category).toBeUndefined();
      });

      const req = httpMock.expectOne('/assets/data/projects.json');
      req.flush(incompleteData);
    });
  });
});
