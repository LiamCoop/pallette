'use client'
import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { colors as initialColors } from "@/data/types";
import Pallette from "./pallette";
import ColorEditor from "./ColorEditor";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface Project {
  id: string
  name: string
  colors: Record<string, Record<string, string>>
  createdAt: Date
  updatedAt: Date
}

export default function Container() {
  const { data: session } = useSession()
  const [colors, setColors] = useState(initialColors)
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const isSwitchingProject = useRef(false)

  // Load projects from database when user signs in
  useEffect(() => {
    if (session?.user?.id) {
      fetchProjects()
    } else {
      // Reset when user signs out
      isSwitchingProject.current = true
      setProjects([])
      setCurrentProject(null)
      setColors(initialColors)
    }
  }, [session?.user?.id])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const projects = await response.json()
        const parsed = projects.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        }))
        setProjects(parsed)
        
        // If there's a saved current project, load it
        if (session?.user?.id) {
          const currentProjectId = localStorage.getItem(`current_project_${session.user.id}`)
          if (currentProjectId) {
            const project = parsed.find((p: Project) => p.id === currentProjectId)
            if (project) {
              isSwitchingProject.current = true
              setCurrentProject(project)
              setColors(project.colors)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }


  // Save current project when it changes
  useEffect(() => {
    if (session?.user?.id && currentProject) {
      localStorage.setItem(`current_project_${session.user.id}`, currentProject.id)
    }
  }, [currentProject, session?.user?.id])

  // Update current project colors when colors change (but not when switching projects)
  useEffect(() => {
    if (currentProject && !isSwitchingProject.current) {
      updateProjectInDatabase(currentProject.id, { colors })
    }
    if (isSwitchingProject.current) {
      isSwitchingProject.current = false
    }
  }, [colors])

  const updateProjectInDatabase = async (projectId: string, updates: { name?: string; colors?: Record<string, Record<string, string>> }) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const updatedProject = await response.json()
        const project = {
          ...updatedProject,
          createdAt: new Date(updatedProject.createdAt),
          updatedAt: new Date(updatedProject.updatedAt)
        }
        
        setCurrentProject(project)
        setProjects(prev => prev.map(p => p.id === projectId ? project : p))
      }
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const handleProjectCreate = async (name: string) => {
    if (!session?.user?.id) return
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          colors: { ...initialColors }
        }),
      })

      if (response.ok) {
        const newProject = await response.json()
        const project = {
          ...newProject,
          createdAt: new Date(newProject.createdAt),
          updatedAt: new Date(newProject.updatedAt)
        }
        
        setProjects(prev => [...prev, project])
        isSwitchingProject.current = true
        setCurrentProject(project)
        setColors(project.colors)
      }
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const handleProjectSelect = (project: Project) => {
    isSwitchingProject.current = true
    setCurrentProject(project)
    setColors(project.colors)
  }

  const handleProjectDelete = async (projectId: string) => {
    if (!session?.user?.id) return
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId))
        
        if (currentProject?.id === projectId) {
          const remainingProjects = projects.filter(p => p.id !== projectId)
          if (remainingProjects.length > 0) {
            handleProjectSelect(remainingProjects[0])
          } else {
            isSwitchingProject.current = true
            setCurrentProject(null)
            setColors(initialColors)
            if (session?.user?.id) {
              localStorage.removeItem(`current_project_${session.user.id}`)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const handleProjectRename = async (projectId: string, newName: string) => {
    if (!session?.user?.id) return
    
    try {
      await updateProjectInDatabase(projectId, { name: newName })
    } catch (error) {
      console.error('Error renaming project:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header colors={colors} />
      <div className="flex">
        <Sidebar
          currentProject={currentProject}
          projects={projects}
          onProjectSelect={handleProjectSelect}
          onProjectCreate={handleProjectCreate}
          onProjectDelete={handleProjectDelete}
          onProjectRename={handleProjectRename}
        />
        <div className="flex flex-1 gap-8">
          <div className="flex-1">
            <Pallette colors={colors} setColors={setColors} />
          </div>
          <div className="w-96 p-8">
            <ColorEditor colors={colors} setColors={setColors} />
          </div>
        </div>
      </div>
    </div>
  )
}