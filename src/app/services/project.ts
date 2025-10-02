import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Project {
  id: number;
  title: string;
  description: string;
  stack: string;
  image: string;
  githubLink: string;
  demoLink?: string | null;
  featured?: boolean;
  category?: string;
  technologies?: string[];
  status?: string;
  date?: string;
}

export interface ProjectCategory {
  id: string;
  name: string;
  description: string;
}

export interface ProjectData {
  projects: Project[];
  categories: ProjectCategory[];
  technologies: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  
  private projectsData: ProjectData | null = null;
  
  constructor(private http: HttpClient) {}
  

  // Cargar proyectos desde JSON
  loadProjects(): Observable<ProjectData> {
    if (this.projectsData) {
      return of(this.projectsData);
    }

    return this.http.get<ProjectData>('assets/data/projects.json').pipe(
      map(data => {
        this.projectsData = data;
        return data;
      }),
      catchError(error => {
        console.error('Error loading projects:', error);
        throw error;
      })
    );
  }

  getProjects(): Project[] {
    return this.projectsData?.projects || [];
  }

  getFeaturedProjects(): Project[] {
    const projects = this.getProjects();
    return projects.filter(project => project.featured);
  }

  getProjectsByCategory(category: string): Project[] {
    const projects = this.getProjects();
    return projects.filter(project => project.category === category);
  }

  getProjectById(id: number): Project | undefined {
    const projects = this.getProjects();
    return projects.find(project => project.id === id);
  }

  getCategories(): ProjectCategory[] {
    return this.projectsData?.categories || [];
  }

  getTechnologies(): string[] {
    return this.projectsData?.technologies || [];
  }

  // Método para agregar un nuevo proyecto (para futuras implementaciones)
  addProject(project: Omit<Project, 'id'>): Observable<Project> {
    const newProject: Project = {
      ...project,
      id: Math.max(...this.getProjects().map(p => p.id)) + 1
    };
    
    // En una implementación real, aquí harías una llamada HTTP para guardar
    return of(newProject);
  }
}
