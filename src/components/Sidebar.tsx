'use client'
import { useSession } from "next-auth/react"
import { useState } from "react"

interface Project {
  id: string
  name: string
  colors: Record<string, Record<string, string>>
  createdAt: Date
  updatedAt: Date
}

interface SidebarProps {
  currentProject: Project | null
  projects: Project[]
  onProjectSelect: (project: Project) => void
  onProjectCreate: (name: string) => void
  onProjectDelete: (projectId: string) => void
  onProjectRename: (projectId: string, newName: string) => void
}

export function Sidebar({ 
  currentProject, 
  projects, 
  onProjectSelect, 
  onProjectCreate, 
  onProjectDelete,
  onProjectRename
}: SidebarProps) {
  const { data: session, status } = useSession()
  const [isCreating, setIsCreating] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [editProjectName, setEditProjectName] = useState('')

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onProjectCreate(newProjectName.trim())
      setNewProjectName('')
      setIsCreating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateProject()
    } else if (e.key === 'Escape') {
      setIsCreating(false)
      setNewProjectName('')
    }
  }

  const handleStartEdit = (project: Project) => {
    setEditingProject(project.id)
    setEditProjectName(project.name)
  }

  const handleSaveEdit = () => {
    if (editingProject && editProjectName.trim()) {
      onProjectRename(editingProject, editProjectName.trim())
    }
    setEditingProject(null)
    setEditProjectName('')
  }

  const handleCancelEdit = () => {
    setEditingProject(null)
    setEditProjectName('')
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  if (status === "loading") {
    return (
      <div className="w-64 bg-white border-r border-gray-200 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col p-6">
        <div className="text-center pt-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Projects</h3>
          <p className="text-sm text-gray-600 text-center">
            Sign in to create and manage your color palette projects
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
          <button
            onClick={() => setIsCreating(true)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            title="Create new project"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* New Project Input */}
      {isCreating && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!newProjectName.trim()) {
                setIsCreating(false)
              }
            }}
            placeholder="Project name..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-600"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCreateProject}
              className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false)
                setNewProjectName('')
              }}
              className="px-3 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">No projects yet</p>
            <p className="text-xs mt-1">Create your first project to get started</p>
          </div>
        ) : (
          <div className="p-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  currentProject?.id === project.id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onProjectSelect(project)}
              >
                <div className="flex-1 min-w-0">
                  {editingProject === project.id ? (
                    <input
                      type="text"
                      value={editProjectName}
                      onChange={(e) => setEditProjectName(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      onBlur={handleSaveEdit}
                      className="text-sm font-medium bg-transparent border-none outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 -mx-1 w-full text-gray-700 placeholder-gray-600"
                      autoFocus
                    />
                  ) : (
                    <div className="group/name flex items-center gap-1">
                      <h3 className={`text-sm font-medium truncate ${
                        currentProject?.id === project.id ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {project.name}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartEdit(project)
                        }}
                        className="opacity-0 group-hover/name:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-all"
                        title="Rename project"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {Object.keys(project.colors).length} color families
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onProjectDelete(project.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                  title="Delete project"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {projects.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}