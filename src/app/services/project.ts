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
  
  // Datos de respaldo en caso de que falle la carga del JSON
  private fallbackProjects: Project[] = [
    {
      id: 1,
      title: "Incubadora NOC",
      description: "Plataforma para gestionar cursos, alumnos y pagos. Proyecto Bootcamp Santex.",
      stack: "Angular · SCSS · Node.js · Express · Sequelize · MySQL",
      image: "assets/img/incubadora.png",
      githubLink: "https://github.com/Ludmimar/Incubadora_Noc"
    },
    {
      id: 2,
      title: "Conversor de Moneda",
      description: "App en Java orientada a objetos para practicar lógica y POO.",
      stack: "Java · POO",
      image: "assets/img/conversor.png",
      githubLink: "https://github.com/Ludmimar/DesafioConversorDeMoneda"
    },
    {
      id: 3,
      title: "Beauty Shop",
      description: "Página de belleza desarrollada para practicar la implementación de un carrito de compras dinámico.",
      stack: "HTML · CSS · JS",
      image: "assets/img/beauty.jpg",
      githubLink: "https://github.com/Ludmimar/Actividad_Semana_04_Bam_2.0",
      demoLink: "https://ludmila-martos-beauty.netlify.app/"
    },
    {
      id: 4,
      title: "Gestión de Notas de Alumnos",
      description: "El programa permite cargar alumnos, calcular promedios, asignar condiciones y realizar búsquedas y modificaciones de notas de forma interactiva con la consola.",
      stack: "Python",
      image: "assets/img/Python-Emblem.png",
      githubLink: "https://github.com/Ludmimar/ISSD/tree/main/Programacion%201/Coloquio%20Promocional"
    },
    {
     id: "5",
    title: "Java Digitalers",
    description: "Repositorio del Curso Java Fullstack & Desarrollo Web.",
    stack: "Java · Spring · HTML · CSS · JS",
    link: "https://github.com/Ludmimar/Digitalers-Java-Developer-Telecom",
    image: "https://raw.githubusercontent.com/Ludmimar/Portfolio_Martos_Ldmila/8756fdf4509c5b8d43d37d0eda08e6ad06e1a1bc/img/java-original.svg"
    },
    {
      id: 6,
      title: "Codo a codo",
      description: "Landing page interactiva que permite explorar diferentes cursos de formación en línea.",
      stack: "HTML · CSS · JS",
      image: "assets/img/salusjpg.jpg",
      githubLink: "https://github.com/Ludmimar/CodoaCodo-Grupo01",
      demoLink: "https://ludmimar.github.io/CodoaCodo-Grupo01"
    },
    {
      id: 7,
      title: "Desafio-Java",
      description: "Aplicación en Java que consume la API pública Gutendex para explorar el catálogo de libros de Project Gutenberg.",
      stack: "JAVA",
      image: "assets/img/java.png",
      githubLink: "https://github.com/Ludmimar/Desafio-Java-trabajando-con-lambdas-streams-y-Spring-Framework"
    },
    {
      id: 8,
      title: "Encriptador de texto",
      description: "Aplicación web en JavaScript que encripta y desencripta textos usando reglas de sustitución, con posibilidad de copiar el resultado al portapapeles. Proyecto pensado para practicar manipulación del DOM, uso de expresiones regulares, eventos en botones y diseño responsive con CSS.",
      stack: "HTML · CSS · JS",
      image: "assets/img/encriptador.jpg",
      githubLink: "https://github.com/Ludmimar/Encriptador-de-Texto/tree/main?tab=readme-ov-file",
      demoLink: "https://ludmimar.github.io/Encriptador-de-Texto/"
    },
    {
      id: 9,
      title: "Proyecto: API REST Portfolio Personal",
      description: "El proyecto implementa un sistema CRUD completo para administrar: ->Personas: datos personales y perfil. ->Educación: registros académicos. ->Experiencia: proyectos y experiencia laboral.",
      stack: "Java · SpringBoot · MySQL",
      image: "assets/img/java.png",
      githubLink: "https://github.com/Ludmimar/Argentina-Programa-MyPortfolio-Backend"
    }
  ];

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
        // Retornar datos de respaldo
        this.projectsData = {
          projects: this.fallbackProjects,
          categories: [
            { id: 'frontend', name: 'Frontend', description: 'Proyectos de interfaz de usuario' },
            { id: 'backend', name: 'Backend', description: 'Proyectos de servidor y APIs' },
            { id: 'fullstack', name: 'Full Stack', description: 'Proyectos completos frontend + backend' }
          ],
          technologies: ['Angular', 'Java', 'JavaScript', 'HTML', 'CSS', 'Python', 'Node.js', 'MySQL']
        };
        return of(this.projectsData);
      })
    );
  }

  getProjects(): Project[] {
    return this.projectsData?.projects || this.fallbackProjects;
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
