import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService, Project, ProjectCategory } from '../../services/project';

@Component({
  selector: 'app-projects',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './projects.html',
  styleUrl: './projects.scss'
})
export class Projects implements OnInit, OnDestroy {
  projects: Project[] = [];
  categories: ProjectCategory[] = [];
  selectedProject: Project | null = null;
  isModalOpen = false;
  selectedCategory: string = 'all';
  isLoading = true;
  imageErrors: Set<number> = new Set(); // Track which images failed to load

  // TrackBy functions para optimizar rendering
  trackByProjectId: TrackByFunction<Project> = (index: number, project: Project) => project.id;
  trackByCategoryId: TrackByFunction<ProjectCategory> = (index: number, category: ProjectCategory) => category.id;

  constructor(
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProjects();
  }

  ngOnDestroy() {
    // Cleanup si es necesario
  }

  loadProjects() {
    this.isLoading = true;
    this.cdr.markForCheck();
    
    this.projectService.loadProjects().subscribe({
      next: (data) => {
        this.projects = data.projects;
        this.categories = data.categories;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.projects = this.projectService.getProjects();
        this.categories = this.projectService.getCategories();
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  filterProjectsByCategory(category: string) {
    this.selectedCategory = category;
    if (category === 'all') {
      this.projects = this.projectService.getProjects();
    } else {
      this.projects = this.projectService.getProjectsByCategory(category);
    }
    this.cdr.markForCheck();
  }

  getFilteredProjects(): Project[] {
    if (this.selectedCategory === 'all') {
      return this.projects;
    }
    return this.projects.filter(project => project.category === this.selectedCategory);
  }

  openModal(project: Project) {
    this.selectedProject = project;
    this.isModalOpen = true;
    this.cdr.markForCheck();
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedProject = null;
    this.cdr.markForCheck();
  }

  getShortDescription(description: string): string {
    return description.length > 80 ? description.substring(0, 80) + '...' : description;
  }

  isIconImage(imagePath: string): boolean {
    // Todas las imágenes ahora usan el mismo tamaño, pero mantenemos la lógica
    // para futuras personalizaciones si es necesario
    return imagePath.includes('devicon') || 
           imagePath.includes('Python-Emblem') || 
           imagePath.includes('java.png');
  }

  onImageError(event: Event, project: Project): void {
    console.warn(`Failed to load image for project ${project.title}: ${project.image}`);
    this.imageErrors.add(project.id);
    this.cdr.markForCheck();
  }

  onImageLoad(event: Event, project: Project): void {
    // Remove from errors if image loads successfully
    this.imageErrors.delete(project.id);
    this.cdr.markForCheck();
  }

  onModalImageError(event: Event): void {
    console.warn('Failed to load image in modal:', this.selectedProject?.image);
  }

  hasImageError(project: Project): boolean {
    return this.imageErrors.has(project.id);
  }
}