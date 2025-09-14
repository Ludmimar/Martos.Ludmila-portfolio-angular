import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Projects } from './projects';
import { ProjectService, Project, ProjectCategory } from '../../services/project';

describe('Projects', () => {
  let component: Projects;
  let fixture: ComponentFixture<Projects>;
  let projectService: ProjectService;
  let httpMock: HttpTestingController;

  const mockProjectsData = {
    projects: [
      {
        id: 1,
        title: 'Test Project 1',
        description: 'Test description 1',
        stack: 'Angular · TypeScript',
        image: 'test-image1.png',
        githubLink: 'https://github.com/test1',
        demoLink: 'https://demo1.test',
        featured: true,
        category: 'frontend',
        technologies: ['Angular', 'TypeScript'],
        status: 'completed',
        date: '2024-01-01'
      },
      {
        id: 2,
        title: 'Test Project 2',
        description: 'Test description 2',
        stack: 'Java · Spring',
        image: 'test-image2.png',
        githubLink: 'https://github.com/test2',
        demoLink: null,
        featured: false,
        category: 'backend',
        technologies: ['Java', 'Spring'],
        status: 'completed',
        date: '2024-02-01'
      }
    ],
    categories: [
      {
        id: 'frontend',
        name: 'Frontend',
        description: 'Frontend projects'
      },
      {
        id: 'backend',
        name: 'Backend',
        description: 'Backend projects'
      }
    ],
    technologies: ['Angular', 'TypeScript', 'Java', 'Spring']
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Projects, HttpClientTestingModule],
      providers: [ProjectService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Projects);
    component = fixture.componentInstance;
    projectService = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
    
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.projects).toEqual([]);
      expect(component.categories).toEqual([]);
      expect(component.selectedProject).toBeNull();
      expect(component.isModalOpen).toBe(false);
      expect(component.selectedCategory).toBe('all');
      expect(component.isLoading).toBe(true);
    });

    it('should call loadProjects on init', () => {
      const loadProjectsSpy = jest.spyOn(component, 'loadProjects');

    component.ngOnInit();

      expect(loadProjectsSpy).toHaveBeenCalled();
    });
  });

  describe('loadProjects', () => {
    it('should load projects successfully', fakeAsync(() => {
      component.loadProjects();
      
      const req = httpMock.expectOne('/assets/data/projects.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockProjectsData);
      
      tick();
      
      expect(component.projects).toEqual(mockProjectsData.projects);
      expect(component.categories).toEqual(mockProjectsData.categories);
      expect(component.isLoading).toBe(false);
    }));

    it('should handle loading error and use fallback data', fakeAsync(() => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      component.loadProjects();
      
      const req = httpMock.expectOne('/assets/data/projects.json');
      req.error(new ErrorEvent('Network error'));
      
      tick();
      
      expect(component.projects).toBeDefined();
      expect(component.categories).toBeDefined();
      expect(component.isLoading).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    }));

    it('should set loading state correctly', fakeAsync(() => {
      expect(component.isLoading).toBe(true);
      
      component.loadProjects();
      
      const req = httpMock.expectOne('/assets/data/projects.json');
      req.flush(mockProjectsData);
      
      tick();
      
      expect(component.isLoading).toBe(false);
    }));
  });

  describe('filterProjectsByCategory', () => {
    beforeEach(() => {
      component.projects = mockProjectsData.projects;
      component.categories = mockProjectsData.categories;
  });

  it('should filter projects by category', () => {
      component.filterProjectsByCategory('frontend');
      
      expect(component.selectedCategory).toBe('frontend');
      expect(component.projects).toHaveLength(1);
      expect(component.projects[0].category).toBe('frontend');
    });

    it('should show all projects when category is "all"', () => {
    component.filterProjectsByCategory('all');

    expect(component.selectedCategory).toBe('all');
      expect(component.projects).toEqual(mockProjectsData.projects);
    });

    it('should handle non-existent category', () => {
      component.filterProjectsByCategory('nonexistent');
      
      expect(component.selectedCategory).toBe('nonexistent');
      expect(component.projects).toHaveLength(0);
    });

    it('should handle empty projects array', () => {
      component.projects = [];
      component.filterProjectsByCategory('frontend');
      
      expect(component.selectedCategory).toBe('frontend');
      expect(component.projects).toHaveLength(0);
    });
  });

  describe('getFilteredProjects', () => {
    beforeEach(() => {
      component.projects = mockProjectsData.projects;
    });

    it('should return all projects when selectedCategory is "all"', () => {
      component.selectedCategory = 'all';
      
      const filteredProjects = component.getFilteredProjects();
      
      expect(filteredProjects).toEqual(mockProjectsData.projects);
    });

    it('should return filtered projects by category', () => {
    component.selectedCategory = 'frontend';

    const filteredProjects = component.getFilteredProjects();

      expect(filteredProjects).toHaveLength(1);
    expect(filteredProjects[0].category).toBe('frontend');
  });

    it('should return empty array for non-existent category', () => {
      component.selectedCategory = 'nonexistent';

    const filteredProjects = component.getFilteredProjects();

      expect(filteredProjects).toHaveLength(0);
    });
  });

  describe('Modal Management', () => {
    beforeEach(() => {
      component.projects = mockProjectsData.projects;
  });

  it('should open modal with selected project', () => {
      const project = mockProjectsData.projects[0];

    component.openModal(project);

    expect(component.selectedProject).toBe(project);
      expect(component.isModalOpen).toBe(true);
  });

    it('should close modal and clear selected project', () => {
      component.selectedProject = mockProjectsData.projects[0];
    component.isModalOpen = true;

    component.closeModal();

    expect(component.selectedProject).toBeNull();
      expect(component.isModalOpen).toBe(false);
    });

    it('should handle opening modal with null project', () => {
      component.openModal(null as any);
      
      expect(component.selectedProject).toBeNull();
      expect(component.isModalOpen).toBe(true);
    });

    it('should handle opening modal with undefined project', () => {
      component.openModal(undefined as any);
      
      expect(component.selectedProject).toBeUndefined();
      expect(component.isModalOpen).toBe(true);
    });
  });

  describe('getShortDescription', () => {
    it('should truncate long descriptions', () => {
      const longDescription = 'A'.repeat(100);
    const shortDescription = component.getShortDescription(longDescription);

      expect(shortDescription).toBe('A'.repeat(80) + '...');
      expect(shortDescription.length).toBe(83);
  });

    it('should return short descriptions unchanged', () => {
    const shortDescription = 'Short description';
    const result = component.getShortDescription(shortDescription);

    expect(result).toBe(shortDescription);
    });

    it('should handle exactly 80 character descriptions', () => {
      const exactDescription = 'A'.repeat(80);
      const result = component.getShortDescription(exactDescription);
      
      expect(result).toBe(exactDescription);
      expect(result.length).toBe(80);
    });

    it('should handle empty descriptions', () => {
      const result = component.getShortDescription('');
      
      expect(result).toBe('');
    });

    it('should handle null/undefined descriptions', () => {
      expect(() => component.getShortDescription(null as any)).not.toThrow();
      expect(() => component.getShortDescription(undefined as any)).not.toThrow();
    });
  });

  describe('isIconImage', () => {
    it('should identify devicon images', () => {
      expect(component.isIconImage('path/to/devicon-image.svg')).toBe(true);
      expect(component.isIconImage('devicon-angular.svg')).toBe(true);
    });

    it('should identify Python emblem images', () => {
      expect(component.isIconImage('assets/img/Python-Emblem.png')).toBe(true);
      expect(component.isIconImage('Python-Emblem.png')).toBe(true);
    });

    it('should identify Java images', () => {
      expect(component.isIconImage('assets/img/java.png')).toBe(true);
      expect(component.isIconImage('java.png')).toBe(true);
    });

    it('should return false for regular images', () => {
      expect(component.isIconImage('assets/img/beauty.jpg')).toBe(false);
      expect(component.isIconImage('profile.png')).toBe(false);
      expect(component.isIconImage('conversor.png')).toBe(false);
    });

    it('should handle null/undefined image paths', () => {
      expect(component.isIconImage(null as any)).toBe(false);
      expect(component.isIconImage(undefined as any)).toBe(false);
    });

    it('should handle empty image paths', () => {
      expect(component.isIconImage('')).toBe(false);
    });
  });

  describe('Edge Cases', () => {
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

      component.projects = [incompleteProject as Project];
      
      expect(component.projects[0].featured).toBeUndefined();
      expect(component.projects[0].category).toBeUndefined();
      expect(component.projects[0].technologies).toBeUndefined();
    });

    it('should handle projects with null values', () => {
      const projectWithNulls = {
        id: 1,
        title: 'Project with Nulls',
        description: 'Test description',
        stack: 'Angular',
        image: 'test.png',
        githubLink: 'https://github.com/test',
        demoLink: null,
        featured: null,
        category: null,
        technologies: null,
        status: null,
        date: null
      };

      component.projects = [projectWithNulls as Project];
      
      expect(component.projects[0].demoLink).toBeNull();
      expect(component.projects[0].featured).toBeNull();
      expect(component.projects[0].category).toBeNull();
    });

    it('should handle rapid category changes', () => {
      component.projects = mockProjectsData.projects;
      
      // Rapid category changes
      component.filterProjectsByCategory('frontend');
      component.filterProjectsByCategory('backend');
      component.filterProjectsByCategory('all');
      component.filterProjectsByCategory('frontend');
      
      expect(component.selectedCategory).toBe('frontend');
      expect(component.projects).toHaveLength(1);
    });

    it('should handle rapid modal operations', () => {
      component.projects = mockProjectsData.projects;
      
      // Rapid modal operations
      component.openModal(mockProjectsData.projects[0]);
      component.closeModal();
      component.openModal(mockProjectsData.projects[1]);
      component.closeModal();
      
      expect(component.isModalOpen).toBe(false);
      expect(component.selectedProject).toBeNull();
    });

    it('should handle concurrent loadProjects calls', fakeAsync(() => {
      const promises = [
        component.loadProjects(),
        component.loadProjects(),
        component.loadProjects()
      ];

      const req = httpMock.expectOne('/assets/data/projects.json');
      req.flush(mockProjectsData);
      
      tick();
      
      expect(component.projects).toEqual(mockProjectsData.projects);
    }));

    it('should handle projects with special characters', () => {
      const specialProject = {
        id: 1,
        title: 'Proyecto con Caracteres Especiales: áéíóú ñ ç',
        description: 'Descripción con símbolos: @#$%^&*()',
        stack: 'Angular · TypeScript',
        image: 'test.png',
        githubLink: 'https://github.com/test',
        featured: true,
        category: 'frontend',
        technologies: ['Angular', 'TypeScript'],
        status: 'completed',
        date: '2024-01-01'
      };

      component.projects = [specialProject as Project];
      
      expect(component.projects[0].title).toContain('áéíóú');
      expect(component.projects[0].description).toContain('@#$%^&*()');
    });

    it('should handle very long project data', () => {
      const longProject = {
        id: 1,
        title: 'A'.repeat(1000),
        description: 'A'.repeat(5000),
        stack: 'A'.repeat(500),
        image: 'test.png',
        githubLink: 'https://github.com/test',
        featured: true,
        category: 'frontend',
        technologies: Array.from({ length: 100 }, (_, i) => `Tech${i}`),
        status: 'completed',
        date: '2024-01-01'
      };

      component.projects = [longProject as Project];
      
      expect(component.projects[0].title.length).toBe(1000);
      expect(component.projects[0].description.length).toBe(5000);
      expect(component.projects[0].technologies?.length).toBe(100);
    });
  });

  describe('Performance', () => {
    it('should handle large number of projects efficiently', () => {
      const largeProjectsArray = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        title: `Project ${i}`,
        description: `Description ${i}`,
        stack: `Stack ${i}`,
        image: `image${i}.png`,
        githubLink: `https://github.com/project${i}`,
        featured: i % 2 === 0,
        category: i % 2 === 0 ? 'frontend' : 'backend',
        technologies: [`Tech${i}`],
        status: 'completed',
        date: '2024-01-01'
      }));

      component.projects = largeProjectsArray as Project[];
      
      const startTime = performance.now();
      component.filterProjectsByCategory('frontend');
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should handle rapid getFilteredProjects calls efficiently', () => {
      component.projects = mockProjectsData.projects;
      
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        component.selectedCategory = i % 2 === 0 ? 'frontend' : 'backend';
        component.getFilteredProjects();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50); // Should complete in less than 50ms
  });
});

  describe('Integration', () => {
    it('should work with ProjectService methods', () => {
      const getProjectsSpy = jest.spyOn(projectService, 'getProjects').mockReturnValue(mockProjectsData.projects);
      const getCategoriesSpy = jest.spyOn(projectService, 'getCategories').mockReturnValue(mockProjectsData.categories);
      
      component.loadProjects();
      
      expect(getProjectsSpy).toHaveBeenCalled();
      expect(getCategoriesSpy).toHaveBeenCalled();
    });

    it('should maintain state consistency across operations', () => {
      component.projects = mockProjectsData.projects;
      component.categories = mockProjectsData.categories;
      
      // Filter projects
      component.filterProjectsByCategory('frontend');
      expect(component.projects.length).toBe(1);
      
      // Open modal
      component.openModal(component.projects[0]);
      expect(component.isModalOpen).toBe(true);
      
      // Close modal
      component.closeModal();
      expect(component.isModalOpen).toBe(false);
      
      // Filter again
      component.filterProjectsByCategory('all');
      expect(component.projects.length).toBe(2);
    });

    it('should handle service errors gracefully', fakeAsync(() => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      component.loadProjects();
      
      const req = httpMock.expectOne('/assets/data/projects.json');
      req.error(new ErrorEvent('Network error'));
      
      tick();
      
      // Should fallback to service methods
      expect(component.projects).toBeDefined();
      expect(component.categories).toBeDefined();
      expect(component.isLoading).toBe(false);
      
      consoleSpy.mockRestore();
    }));
  });

  describe('Template Integration', () => {
    it('should render loading state', () => {
      component.isLoading = true;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const loadingElement = compiled.querySelector('.loading-state');
      
      expect(loadingElement).toBeTruthy();
    });

    it('should render projects when loaded', () => {
      component.projects = mockProjectsData.projects;
      component.isLoading = false;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const projectCards = compiled.querySelectorAll('.card');
      
      expect(projectCards.length).toBe(2);
    });

    it('should render modal when open', () => {
      component.selectedProject = mockProjectsData.projects[0];
      component.isModalOpen = true;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const modal = compiled.querySelector('.modal.show');
      
      expect(modal).toBeTruthy();
    });

    it('should not render modal when closed', () => {
      component.isModalOpen = false;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const modal = compiled.querySelector('.modal.show');
      
      expect(modal).toBeFalsy();
    });
  });
});